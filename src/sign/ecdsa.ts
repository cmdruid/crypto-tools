import * as Noble from '@noble/secp256k1'

export async function sign(
  msgHash : string, 
  privKey : Uint8Array
) : Promise<Uint8Array> {
  return Noble.sign(msgHash, privKey)
}

export function verify(
  signature : Uint8Array,
  msgHash   : string,
  pubKey    : Uint8Array
) : boolean {
  return Noble.verify(signature, msgHash, pubKey)
}
