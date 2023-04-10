import { webcrypto as crypto } from '@cmdcode/webcrypto'
import { Buff, Bytes } from '@cmdcode/buff-utils'
import { KeyUtil }     from './utils.js'

export class Cipher {
  private readonly key : CryptoKey

  static async fromSecret (
    secret : Bytes
  ) : Promise<Cipher> {
    const cryptoKey = await KeyUtil.normalize(secret)
    return new Cipher(cryptoKey)
  }

  static async fromShared (
    secret : Bytes,
    shared : Bytes
  ) : Promise<Cipher> {
    const cryptoKey = await KeyUtil.shared(secret, shared)
    return new Cipher(cryptoKey)
  }

  static async encrypt (
    secret  : Bytes | CryptoKey,
    message : Bytes,
    vector ?: Bytes
  ) : Promise<Uint8Array> {
    const msg = Buff.normalize(message)
    const key = await KeyUtil.normalize(secret)
    const iv  = (vector !== undefined) ? Buff.normalize(vector) : Buff.random(16)
    return crypto.subtle
      .encrypt({ name: 'AES-CBC', iv }, key, msg)
      .then((buffer) => Uint8Array.of(...iv, ...new Uint8Array(buffer)))
  }

  static async decrypt (
    secret  : Bytes | CryptoKey,
    message : Bytes,
    vector ?: Bytes
  ) : Promise<Uint8Array> {
    const msg = Buff.normalize(message)
    const key = await KeyUtil.normalize(secret)
    const dat = (vector !== undefined) ? msg : msg.slice(16)
    const iv  = (vector !== undefined) ? Buff.normalize(vector) : msg.slice(0, 16)
    return crypto.subtle
      .decrypt({ name: 'AES-CBC', iv }, key, dat)
      .then((buffer) => new Uint8Array(buffer))
  }

  constructor (cryptoKey : CryptoKey) {
    this.key = cryptoKey
  }

  get secretKey () : Promise<Uint8Array> {
    return KeyUtil.export(this.key)
  }

  get secretHex () : Promise<string> {
    return this.secretKey
      .then(b => Buff.raw(b).hex)
  }

  async encrypt (
    message : Bytes,
    vector ?: Bytes
  ) : Promise<Uint8Array> {
    return Cipher.encrypt(this.key, message, vector)
  }

  async decrypt (
    message : Bytes,
    vector ?: Bytes
  ) : Promise<Uint8Array> {
    return Cipher.decrypt(this.key, message, vector)
  }
}
