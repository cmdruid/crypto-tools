import { Buff, Bytes } from '@cmdcode/buff-utils'
import { Field } from '../ecc.js'
import { group_pubkeys } from './group.js'
import { MusigSession }  from './types.js'
import { isValidField }  from '../schema/validate.js'

export function sign (
  secret_key   : Bytes,
  secret_nonce : Bytes,
  session      : MusigSession
) : Buff {
  // Unpack session and options.
  const { options } = session
  const { xonly = false, throws = false } = options

  // We need to figure these out
  let b : Field
  let e : Field

  // Configure our parity bit state.
  let parity = 0

  // Load nonce bytes into a buffer.
  const sn = new Buff(secret_nonce)

  if (sn.length !== 66) {
    // Fail if the nonce length is not (33 * 2) bytes
    safeThrow(`Secret nonce is invalid length: ${sn.length}`, throws)
  }

  // Setup our first nonce value.
  const n1 = new Field(sn.slice(0, 33))
  isValidField(n1.big, { label: 'n1', throws: true })
  const k1 = (xonly && n1.hasOddY) ? n1.negate() : n1

  // Setup our second nonce value.
  const n2 = new Field(sn.slice(33))
  isValidField(n2.big, { label: 'n2', throws: true })
  const k2 = (xonly && n2.hasOddY) ? n2.negate() : n2

  // Calculate our public nonce.
  const pn = Buff.join([ k1.point.x, k2.point.x ])

  if (!session.nonces.includes(pn.hex)) {
    // If public nonce is not included in session, throw error.
    throw new Error(`Public nonce is not included in nonce array: ${pn.hex}`)
  }

  // Init public and private key.
  const sk = new Field(secret_key)
  const pk = sk.point

  // Negate the private key if required.
  const dp = (xonly && parity === 1) ? sk.negate() : sk
  isValidField(dp.big, { label: 'dp', throws: true })

  if (!session.pubkeys.includes(pk.hex)) {
    // If public key is not included in session, throw error.
    throw new Error(`Public key is not included in pubkey array: ${pk.hex}`)
  }

  const Q = group_pubkeys(session.pubkeys)

  const d : Field = (xonly) ? (g * gacc * d % N) : dp

  const bk2 = b.mul(k2)
  const ead = e.mul(a).mul(d)
  const sig = k1.add(bk2).add(ead)

  PartialSigVerifyInternal(sig, pn, pk, session)

  return sig.buff
}
