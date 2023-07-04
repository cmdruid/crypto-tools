import { Buff, Bytes }  from '@cmdcode/buff-utils'
import { Field, Point } from './ecc.js'
import { getXOnlyPub, tagHash, assert } from './utils.js'

import {
  signer_defaults,
  SignerConfig
} from './config/signer.js'

const FIELD_SIZE  = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2Fn
const CURVE_ORDER = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141n

export function sign (
  secret  : Bytes,
  message : Bytes,
  config ?: SignerConfig
) : Buff {
  /**
   * Implementation of signature algorithm as specified in BIP0340.
   * https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
   */
  const opt = signer_defaults(config)
  const { adaptor, aux, nonce, tweak, xonly } = opt

  // Normalize our message into bytes.
  const m = Buff.bytes(message)
  // Let d' equal the integer value of secret key.
  const dp = new Field(secret)
  // Let P equal d' * G
  const P  = dp.point
  // For taproot: If P has an odd Y coordinate, return negated version of d'.
  const d  = (xonly && P.hasOddY) ? dp.negated.big : dp.big
  // Hash the auxiliary data according to BIP 0340.
  if (aux === undefined) {
    throw new Error('aux is undefined!')
  }
  const a  = tagHash('BIP0340/aux', [ aux ])
  // Let t equal the byte-wise xor of (d) and (a).
  const t  = d ^ a.big
  // Include our nonce values into a tagged hash.
  const seed = (nonce !== undefined)
    ? nonce
    : Buff.join([ t, P.x.raw ])
  // Use a tagged hash for our nonce value.
  const n = tagHash('BIP0340/nonce', [ seed, m ])
  // Let k' equal our nonce mod N.
  const kp = new Field(n)
  // Let R equal k' * G.
  let R  = kp.point
  // If adaptor is present:
  if (adaptor !== undefined) {
    // Normalize adaptor.
    const b = Buff.bytes(adaptor)
    // Revive adaptor point.
    const T = new Point(b.big)
    // Add adaptor point to R.
    R = R.add(T)
  }
  // For taproot: If R has an odd Y coordinate, return negated version of k'.
  const k  = (xonly && R.hasOddY) ? kp.negated.big : kp.big
  // Let c equal the tagged hash('BIP0340/challenge' || R || P || m) mod n.
  const c  = new Field(tagHash('BIP0340/challenge', [ R.x.raw, P.x.raw, m ]))
  // Let s equal (k + ed) mod n.
  let s  = new Field(k + (c.big * d))
  // If tweak is defined:
  if (tweak !== undefined) {
    const b = Buff.bytes(tweak)
    s = s.add(b.big)
  }
  // Return (R || s) as a signature
  return (xonly)
    ? Buff.join([ R.x.raw, s.raw ])
    : Buff.join([ R.raw, s.raw ])
}

export function verify (
  signature : Bytes,
  message   : Bytes,
  pubkey    : Bytes,
  config    : SignerConfig
) : boolean {
   /**
   * Implementation of verify algorithm as specified in BIP0340.
   * https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
   */
  const { throws, xonly } = signer_defaults(config)

  // Get the Point value for pubkey.
  const P = new Point(
    (xonly) ? getXOnlyPub(pubkey) : pubkey
  )

  // Normalize the message into bytes.
  const m = Buff.bytes(message)

  // Convert signature into a stream object.
  const stream = Buff.bytes(signature).stream

  // Check if the signature size is at least 64 bytes.
  if (stream.size < 64) {
    return assert('Signature length is too small: ' + String(stream.size), throws)
  }

  // Let r equal first 32 bytes of signature.
  const r = new Point(
    (stream.size === 64)
      ? stream.read(32)
      : stream.read(33)
  )

  // Fail if r > p (field size).
  if (r.x.big > FIELD_SIZE) {
    return assert('Signature r value greater than field size!', throws)
  }

  // Let s equal next 32 bytes of signature.
  const s = stream.read(32)

  // Fail if s > n (curve order).
  if (s.big > CURVE_ORDER) {
    return assert('Signature s value greater than curve order!', throws)
  }

  // Let c equal the tagged hash('BIP0340/challenge' || R || P || m) mod n.
  const c  = new Field(tagHash('BIP0340/challenge', [ r.x.raw, P.x.raw, m ]))

  // Let R = s * G - eP.
  const sG = new Field(s).point
  const eP = P.mul(c.big)
  const R  = sG.sub(eP)

  // Reject if R value has an odd Y coordinate.
  if (xonly && R.hasOddY) {
    return assert('Signature R value has odd Y coordinate!', throws)
  }

  // Reject if R value is infinite.
  if (R.x.big === 0n) {
    return assert('Signature R value is infinite!', throws)
  }

  // Return if x coordinate of R value equals r.
  return R.x.big === r.x.big
}
