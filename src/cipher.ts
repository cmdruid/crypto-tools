import { webcrypto as crypto } from 'crypto'
import { importKey, getSharedKey } from './keys.js'

export default class Cipher {
  private readonly secret: CryptoKey

  static async from(secret: Uint8Array | CryptoKey) : Promise<Cipher> {
    return secret instanceof CryptoKey 
      ? new Cipher(secret)
      : new Cipher(await importKey(secret))
  }

  static async encrypt(
    secret : CryptoKey,
    data   : Uint8Array,
    initVector? : Uint8Array
  ) : Promise<Uint8Array> {
    const iv = initVector ?? crypto.getRandomValues(new Uint8Array(16))
    return crypto.subtle
      .encrypt({ name: 'AES-CBC', iv }, secret, data)
      .then((buffer) => Uint8Array.of(...iv, ...new Uint8Array(buffer)))
  }

  static async decrypt(
    secret : CryptoKey,
    data   : Uint8Array
  ) : Promise<Uint8Array> {
    return crypto.subtle
      .decrypt({ name: 'AES-CBC', iv: data.slice(0, 16) }, secret, data.slice(16))
      .then((buffer) => new Uint8Array(buffer))
  }

  constructor(secret: CryptoKey) {
    this.secret = secret
  }

  async encrypt(data : Uint8Array, initVector? : Uint8Array) : Promise<Uint8Array> {
    return Cipher.encrypt(this.secret, data, initVector)
  }

  async decrypt(data : Uint8Array) : Promise<Uint8Array> {
    return Cipher.decrypt(this.secret, data)
  }

  async encryptWithKey(
    key  : Uint8Array,
    data : Uint8Array, 
    initVector? : Uint8Array
  ) : Promise<Uint8Array> {
    const sharedSecret = await getSharedKey(this.secret, key)
    return Cipher.encrypt(sharedSecret, data, initVector)
  }

  async decryptWithKey(
    key  : Uint8Array,
    data : Uint8Array
  ) : Promise<Uint8Array> {
    const sharedSecret = await getSharedKey(this.secret, key)
    return Cipher.decrypt(sharedSecret, data)
  }
}
