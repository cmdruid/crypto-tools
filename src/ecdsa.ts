import { Buff, Bytes }  from '@cmdcode/buff-utils'
import { Field, Point } from './ecc.js'
import { getXOnlyPub, hashTag, safeThrow } from './utils.js'
import { SignerConfig }   from './schema/types.js'
import { SIGNER_DEFAULT } from './schema/defaults.js'

const FIELD_SIZE  = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2Fn
const CURVE_ORDER = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141n

export function sign (
  secret  : Bytes,
  message : Bytes,
  options : Partial<SignerConfig> = {}
) : Buff {
  /**
   * Implementation of signature algorithm as specified in BIP0340.
   * https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
   */
  const { nonce } = { ...SIGNER_DEFAULT, ...options }

  // Normalize our message into bytes.
  const m = Buff.bytes(message)
  // Let d equal the integer value of secret key.
  const d = new Field(secret)
  // Let P equal d' * G
  const P = d.point
  // Hash the auxiliary data according to BIP 0340.
  const k = nonce ?? determine_k(m)

  const r = new Field(k.point.x)

  const ki = k.pow(Field.N - 2n, Field.N)
  // Include our nonce values into a tagged hash.
  const s = r.mul(secret).add(m)
  const R  = kp.point
  // For taproot: If R has an odd Y coordinate, return negated version of k'.
  const k  = (xonly && R.hasOddY) ? kp.negated.big : kp.big
  // Let e equal the tagged hash('BIP0340/challenge' || R || P || m) mod n.
  const e  = new Field(hashTag('BIP0340/challenge', R.x.raw, P.x.raw, m))
  // Let s equal (k + ed) mod n.
  const s  = new Field(k + (e.big * d))
  // Return (R || s) as a signature
  return (xonly)
    ? Buff.join([ R.x.raw, s.raw ])
    : Buff.join([ R.raw, s.raw ])
}

export function verify (
  signature : Bytes,
  message   : Bytes,
  pubkey    : Bytes,
  options   : Partial<SignerConfig> = {}
) : boolean {
   /**
   * Implementation of verify algorithm as specified in BIP0340.
   * https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
   */
  const { throws, xonly } = { ...SIGNER_DEFAULT, ...options }

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
    safeThrow('Signature length is too small: ' + String(stream.size), throws)
  }

  // Let r equal first 32 bytes of signature.
  const r = new Point(
    (stream.size === 64)
      ? stream.read(32)
      : stream.read(33)
  )

  // Fail if r > p (field size).
  if (r.x.big > FIELD_SIZE) {
    safeThrow('Signature r value greater than field size!', throws)
  }

  // Let s equal next 32 bytes of signature.
  const s = stream.read(32)

  // Fail if s > n (curve order).
  if (s.big > CURVE_ORDER) {
    safeThrow('Signature s value greater than curve order!', throws)
  }

  // Let e equal the tagged hash('BIP0340/challenge' || R || P || m) mod n.
  const e  = new Field(hashTag('BIP0340/challenge', r.x.raw, P.x.raw, m))

  // Let R = s * G - eP.
  const sG = new Field(s).point
  const eP = P.mul(e.big)
  const R  = sG.sub(eP)

  // Reject if R value has an odd Y coordinate.
  if (xonly && R.hasOddY) {
    safeThrow('Signature R value has odd Y coordinate!', throws)
  }

  // Reject if R value is infinite.
  if (R.x.big === 0n) {
    safeThrow('Signature R value is infinite!', throws)
  }

  // Return if x coordinate of R value equals r.
  return R.x.big === r.x.big
}
