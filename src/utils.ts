import { hash256 } from './hash.js'

export async function checksum(data: Uint8Array): Promise<Uint8Array> {
  return (await hash256(data)).slice(-4)
}
