import { webcrypto as crypto } from 'crypto'
import { importKey } from './keys.js'

export default class Cipher {
  private secret : CryptoKey | Promise<CryptoKey>

  constructor(secret : Uint8Array | CryptoKey) {
    this.secret = (secret instanceof CryptoKey)
      ? secret
      : importKey(secret)
  }

  async encrypt(
    data : Uint8Array,
    initVector? : Uint8Array
  ) : Promise<Uint8Array> {
    const iv = (initVector) 
      ? initVector 
      : crypto.getRandomValues(new Uint8Array(16))
    const key = await this.secret
    return crypto.subtle
      .encrypt({ name: 'AES-CBC', iv }, key, data)
      .then((buffer) => Uint8Array.of(...iv, ...new Uint8Array(buffer)))
  }

  async decrypt(data : Uint8Array) : Promise<Uint8Array> {
    const key = await this.secret
    return crypto.subtle
      .decrypt({ name: 'AES-CBC', iv: data.slice(0, 16) }, key, data.slice(16))
      .then((buffer) => new Uint8Array(buffer))
  }
}
