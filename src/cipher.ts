import { webcrypto as crypto } from 'crypto'
import { importKey, getSharedKey } from './keys.js'
import { Bytes, normalize } from './util.js'

export default class Cipher {
  private readonly secret: CryptoKey | Promise<CryptoKey>

  static from = (secret: Bytes) : Cipher => {
    return new Cipher(normalize(secret))
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
    data : Uint8Array
  ) : Promise<Uint8Array> {
    return crypto.subtle
      .decrypt({ name: 'AES-CBC', iv: data.slice(0, 16) }, secret, data.slice(16))
      .then((buffer) => new Uint8Array(buffer))
  }

  constructor(secret: CryptoKey | Uint8Array) {
    this.secret = secret instanceof Uint8Array 
      ? importKey(secret)
      : secret
  }

  async encrypt(
    data : Uint8Array, 
    initVector? : Uint8Array
  ) : Promise<Uint8Array> {
    const secret = await this.secret
    return Cipher.encrypt(secret, data, initVector)
  }

  async decrypt(data : Uint8Array) : Promise<Uint8Array> {
    const secret = await this.secret
    return Cipher.decrypt(secret, data)
  }

  async encryptShared(
    key  : Bytes,
    data : Uint8Array,
    initVector? : Uint8Array
  ) : Promise<Uint8Array> {
    const secret = await this.secret
    const shared = normalize(key)
    const sharedSecret = await getSharedKey(secret, shared)
    return Cipher.encrypt(sharedSecret, data, initVector)
  }

  async decryptShared(
    key  : Bytes,
    data : Uint8Array
  ) : Promise<Uint8Array> {
    const secret = await this.secret
    const shared = normalize(key)
    const sharedSecret = await getSharedKey(secret, shared)
    return Cipher.decrypt(sharedSecret, data)
  }
}
