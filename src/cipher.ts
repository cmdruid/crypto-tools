import { Buff, Bytes, Data } from '@cmdcode/buff-utils'
import { KeyUtil } from './utils.js'

const crypto = globalThis.crypto

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
    data    : Data,
    vector ?: Bytes
  ) : Promise<Uint8Array> {
    const key = await KeyUtil.normalize(secret)
    const dat = Buff.serialize(data)
    const iv  = (vector !== undefined) ? Buff.normalize(vector) : Buff.random(16)
    return crypto.subtle
      .encrypt({ name: 'AES-CBC', iv }, key, dat)
      .then((buffer) => Uint8Array.of(...iv, ...new Uint8Array(buffer)))
  }

  static async decrypt (
    secret  : Bytes | CryptoKey,
    data    : Data,
    vector ?: Bytes
  ) : Promise<Uint8Array> {
    data = Buff.serialize(data)
    const key = await KeyUtil.normalize(secret)
    const dat = (vector !== undefined) ? data : data.slice(16)
    const iv  = (vector !== undefined) ? Buff.normalize(vector) : data.slice(0, 16)
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
      .then(b => Buff.buff(b).toHex())
  }

  async encrypt (
    data    : Data,
    vector ?: Bytes
  ) : Promise<Uint8Array> {
    return Cipher.encrypt(this.key, data, vector)
  }

  async decrypt (
    data    : Data,
    vector ?: Bytes
  ) : Promise<Uint8Array> {
    return Cipher.decrypt(this.key, data, vector)
  }
}
