import { Buff, Bytes } from '@cmdcode/buff-utils'
import { KeyImport, KeyExport } from './utils.js'

export class Cipher {
  private readonly key: CryptoKey

  static async fromSecret(
    secretKey: Bytes
  ) : Promise<Cipher> {
    const secret    = Buff.normalize(secretKey)
    const cryptoKey = await KeyImport.crypto(secret)
    return new Cipher(cryptoKey)
  }

  static async fromShared(
    secretKey : Bytes,
    sharedKey : Bytes
  ) : Promise<Cipher> {
    const cryptoKey = await KeyImport.shared(secretKey, sharedKey)
    return new Cipher(cryptoKey)
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

  constructor(cryptoKey: CryptoKey) {
    this.key = cryptoKey
  }

  get secretKey() : Promise<Uint8Array> {
    return KeyExport.crypto(this.key)
  }

  get secretHex() : Promise<string> {
    return this.secretKey
      .then(b => Buff.buff(b).toHex())
  }

  async encrypt(
    data : Uint8Array,
    initVector? : Uint8Array
  ) : Promise<Uint8Array> {
    return Cipher.encrypt(this.key, data, initVector)
  }

  async decrypt(data : Uint8Array) : Promise<Uint8Array> {
    return Cipher.decrypt(this.key, data)
  }
}
