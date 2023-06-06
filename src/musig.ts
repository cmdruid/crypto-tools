import { Buff, Bytes }  from '@cmdcode/buff-utils'
import { Field, Point } from './ecc.js'
import { isValidField } from './schema/validate.js'
import { hashTag, safeThrow }      from './utils.js'

const NONCE_CT = 2

function sign (
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

//   const [ group_key, a_1 ] = combine_keys(pubkeys, secret.pub)

//   const group_nonce_points = combine_nonces(nonces)

//   const b = hashTag('hashtag', group_key, group_nonce, message)
//   const R = compuPointte_R(agg_nonce_points)

//   const c = chall_hash(group_key, R, message)

//   const nonce_secrets = 

//   const s = compute_s(c, secret, a_1, nonce_secrets, b)
  
// }



/*  Inputs:
The secret signing key sk: a 32-byte array (optional argument)
The individual public key pk: a 33-byte array (see Modifications to Nonce Generation for the reason that this argument is mandatory)
The x-only aggregate public key aggpk: a 32-byte array (optional argument)
The message m: a byte array (optional argument)[9]
The auxiliary input extra_in: a byte array with 0 ≤ len(extra_in) ≤ 232-1 (optional argument)
*/
function generate_nonce (
  secret  : Bytes,
  message : Bytes,
  pubkeys : Bytes[],
  options : Partial<SignerConfig> = {}
) : {
  sec_nonce : Bytes,
  pub_nonce : Bytes
} | undefined {
  const rand = Buff.random()
  return
}

/**
 *
Algorithm KeyAgg(pk1..u):
Inputs:
The number u of individual public keys with 0 < u < 2^32
The individual public keys pk1..u: u 33-byte arrays
Let pk2 = GetSecondKey(pk1..u)
For i = 1 .. u:
Let Pi = cpoint(pki); fail if that fails and blame signer i for invalid individual public key.
Let ai = KeyAggCoeffInternal(pk1..u, pki, pk2).
Let Q = a1⋅P1 + a2⋅P2 + ... + au⋅Pu
Fail if is_infinite(Q).
Let gacc = 1
Let tacc = 0
Return keyagg_ctx = (Q, gacc, tacc).
 */

function group_pubkeys (pubkeys : Bytes[]) : Point {
  if (pubkeys.length < 2) {
    throw new Error('Not enough keys provided!')
  }

  let Q : Point | null = null

  for (const pk of pubkeys) {
    const P  = cpoint(pk)
    const a  = get_pubkey_coeff(pubkeys, pk)
    const aP = P.add(a)
    Q = (Q !== null) ? Q.add(aP) : aP
  }

  if (Q === null) {
    throw new Error('Q value is null!')
  }

  return Q
}

function gen_nonce (
  sk, 
  pk, 
  aggpk,
  m, 
  extra_in
) {
  const rand = Buff.random()

}

function combine_nonces (
  pubnonces : Bytes[],
  rounds : number = 2,
  size   : number = 33
) : Buff {
  const maxLen = (rounds * size)
  const nonces = pubnonces.map(e => Buff.bytes(e))

  nonces.forEach(e => {
    if (e.length !== maxLen) {
      throw new Error(`Invalid nonce length: ${e.hex} !== ${maxLen}`)
    }
  })

  const aggregate = []

  for (let j = 0; j < rounds; j++) {
    // Define the start and stop indexes
    // for slicing each nonce value.
    const start = j - 1 * size,
          stop  = size
    // Init the R value.
    let R : Point | null = null
    // Iterate through each nonce member.
    for (let i = 1; i < nonces.length; i++) {
      // Calculate point from nonce value.
      const P = cpoint(nonces[i].slice(start, stop))
      // Add point into floating R value.
      R = (R !== null) ? R.add(P) : P
    }
    if (R === null) {
      throw new Error('Aggregate nonce value is null!')
    }
    aggregate.push(cpoint(R.raw).raw)
  }
  return Buff.join(aggregate)
}

function apply_tweak (
  tweak   : Bytes,
  context : KeyContext,
  xonly   : boolean = false
) : KeyContext {
  const { qacc, gacc, tacc } = context

  const t = new Field(tweak)
  const T = t.point
  const Q = new Point(qacc)
  const g = (xonly && Q.hasOddY) ? Field.mod(-1n) : 1n

  if (t.big >= Field.N) {
    throw new Error('Tweak outside field range!')
  }

  console.log('negN:', Field.mod(-1n))

  const Qg = Q.mul(g)
  const QT = Qg.add(T)

  if (QT.x.big === 0n) {
    throw new Error('Key is at infinity!')
  }

  return {
    qacc : QT.raw,
    gacc : Field.mod(g * gacc),
    tacc : t.add(g * tacc).big
  }
}
