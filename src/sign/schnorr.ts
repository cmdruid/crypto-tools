import * as Noble from '@noble/secp256k1'

export async function sign(
  msgHash : string, 
  privKey : Uint8Array
) : Promise<Uint8Array> {
  return Noble.schnorr.sign(msgHash, privKey)
}

export async function verify(
  signature : Uint8Array,
  msgHash   : string,
  pubKey    : Uint8Array
) : Promise<boolean> {
  return Noble.schnorr.verify(signature, msgHash, pubKey)
}
