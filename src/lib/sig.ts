import { Buff, Bytes }  from '@cmdcode/buff'
import { _0n }          from '../const.js'
import { Field, Point } from './ecc.js'
import { hash340 }      from './hash.js'

import {
  get_pubkey,
  get_seckey
} from './keys.js'

import { SignOptions } from '../types.js'

import * as assert from '../assert.js'

export function sign_msg (
  message : Bytes,
  secret  : Bytes,
  options : SignOptions = {}
) : Buff {
  /**
   * Implementation of signature algorithm as specified in BIP0340.
   * https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
   */
  const { adaptor, key_tweak } = options

  // Normalize our message into bytes.
  const m = Buff.bytes(message)
  // Let d' equal the integer value of secret key.
  let dp = Field.mod(secret)
  // If there is a tweak involved, apply it.
  if (key_tweak !== undefined) {
    // Apply the tweaks.
    dp = dp.negated.add(key_tweak)
  }
  // Let P equal d' * G
  const P = dp.point
  // Let d equal d' (negate if needed).
  const d = dp.negated
  // Compute our nonce value.
  const n = gen_nonce(m, d, options)
  // Let k' equal our nonce mod N.
  let kp = Field.mod(n)
  // If adaptor present, apply to k'.
  if (adaptor !== undefined) {
    // Apply the tweak.
    kp = kp.negated.add(adaptor)
  }
  // Let R equal k' * G.
  const R = kp.point
  // For taproot: If R has an odd Y coordinate, return negated version of k'.
  const k = kp.negated.big
  // Let c equal the tagged hash('BIP0340/challenge' || R || P || m) mod n.
  const ch = hash340('BIP0340/challenge', R.x, P.x, m)
  const c  = Field.mod(ch)
  // Let s equal (k + ed) mod n.
  const s  = Field.mod(k + (c.big * d.big))
  // Return (R || s) as a signature
  return Buff.join([ R.x, s.raw ])
}

export function verify_sig (
  signature : Bytes,
  message   : Bytes,
  pubkey    : Bytes,
  options   : SignOptions = {}
) : boolean {
   /**
   * Implementation of verify algorithm as specified in BIP0340.
   * https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
   */
  const { throws = false } = options
  // Normalize the message into bytes.
  const msg = Buff.bytes(message)
  // Convert signature into a stream object.
  const sig = Buff.bytes(signature)
  // Check if the signature size is at least 64 bytes.
  if (sig.length < 64) {
    return assert.fail('Signature length is too small: ' + String(sig.length), throws)
  }
  // Assert that the pubkey is 32 bytes.
  assert.size(pubkey, 32)
  // Lift the pubkey to point P.
  const P  = Point.from_x(pubkey)
  // Let rx equal first 32 bytes of signature.
  const rx = sig.subarray(0, 32)
  // Lift rx to point R.
  const R  = Point.from_x(rx)
  // Let s equal next 32 bytes of signature.
  const s  = sig.subarray(32, 64)
  // Lift s to point sG.
  const sG = Field.mod(s).point
  // Let the challenge equal hash('BIP0340/challenge' || R || P || m).
  const ch = hash340('BIP0340/challenge', R.x, P.x, msg)
  // Let c equal the field value of challenge mod N.
  const c  = Field.mod(ch)
  // Let eP equal point P * c
  const eP = P.mul(c.big)
  // Let r = sG - eP.
  const r  = sG.sub(eP)

  // Reject if R value has an odd Y coordinate.
  if (R.hasOddY) {
    return assert.fail('Signature R value has odd Y coordinate!', throws)
  }

  // Reject if R value is infinite.
  if (R.x.big === _0n) {
    return assert.fail('Signature R value is infinite!', throws)
  }

  // Reject if x coordinate of R value does not equal r.
  if (R.x.big !== r.x.big) {
    return assert.fail(`Signature is invalid! R: ${R.x.hex} r:${r.x.hex}`, throws)
  }

  return R.x.big === r.x.big
}

export function gen_nonce (
  message : Bytes,
  secret  : Bytes,
  options : SignOptions = {}
) : Buff {
  // Unpack config object.
  const { aux, nonce_seed, nonce_tweak, sec_nonce } = options
  // Declare our nonce value
  let nonce : Buff
  // Initialize the nonce based on config.
  if (nonce_seed !== undefined) {
    nonce = Buff.bytes(nonce_seed)
  } else {
    const seed = (aux === null) ? Buff.num(0, 32) : aux
    // Hash the auxiliary data according to BIP 0340.
    const a = hash340('BIP0340/aux', seed ?? Buff.random(32))
    // Let t equal the byte-wise xor of (d) and (a).
    const t = Buff.bytes(secret).big ^ a.big
    // The nonce seed is our xor secret key and public key.
    nonce = Buff.join([ t, get_pubkey(secret, true) ])
  }
  // Compute our nonce as a tagged hash of the seed value and message.
  let sn = (sec_nonce !== undefined)
    ? Field.mod(sec_nonce)
    : Field.mod(hash340('BIP0340/nonce', nonce, message))
  // Apply any internal tweaks that are specified.
  if (nonce_tweak !== undefined) {
    sn = sn.negated.add(nonce_tweak)
  }
  return sn.buff
}

export function recover_key (
  message   : Bytes,
  pubkey    : Bytes,
  seed      : Bytes,
  signature : Bytes
) : Buff {
  const pub   = Buff.bytes(pubkey)
  const sig   = Buff.bytes(signature)
  const s_val = Field.mod(sig.slice(32, 64))
  const nonce = hash340('BIP0340/nonce', seed, message)
  const chal  = hash340('BIP0340/challenge', sig.slice(0, 32), pub, message)
  const k     = get_seckey(nonce, true)
  return s_val.sub(k).div(chal).buff
}
