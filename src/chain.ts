import { Buff, Bytes }     from '@cmdcode/buff-utils'
import { Field }           from './ecc.js'
import { hmac512, sha256 } from './hash.js'

export class KeyChain {

  public readonly key  : Uint8Array
  public readonly code : Uint8Array
  public readonly path : string

  private static increment(buffer : Uint8Array) : Uint8Array {
    /* Find the least significant integer value in the
    * data buffer (using LE), then increment it by one.
    */
    let i = buffer.length
    for (i -= 1; i >= 0; i--) {
      if (buffer[i] < 255) {
        buffer.set([buffer[i] + 1], i)
        return buffer
      }
    }
    throw TypeError('Unable to increment buffer: ' + buffer.toString())
  }

  public static getLink(path? : string) : string {

    if (path === undefined) return '#'

    KeyChain.validatePath(path)

    const link = path.split('/').at(-1)

    if (link === undefined) throw TypeError('Invalid path!')

    return link
  }

  public static validateKey(buff : Uint8Array) : boolean {
    const big = new Buff(buff).toBig()
    return Field.validate(big)
  }
  
  public static validatePath(path : string) : void {
    if (
      !path.includes('/')
      || path.startsWith('/') 
      || path.endsWith('/')
    ) { 
      throw TypeError('Invalid path!') 
    }
  }

  public static async create(
    key   : Bytes,
    code? : Bytes,
    path? : string,
  ) : Promise<KeyChain> {
    /* Perform a SHA-512 operation on the provided key,
    * then an HMAC signing operation using the chain code.
    */

    key  = Buff.normalize(key)
    code = (code !== undefined)
      ? Buff.normalize(code)
      : await sha256(key)
     
    const link  = KeyChain.getLink(path),
          tweak = Buff.serialize(link),
          bytes = Buff.join([key, tweak]).toBytes()

    console.log('link:', link)
    console.log('path:', path)

    const I  = await hmac512(code, bytes),
          IL = I.slice(0, 32),
          IR = I.slice(32)

    console.log('tweak:', Buff.buff(IL).toHex())
    console.log('code:', Buff.buff(IR).toHex())

    if (!KeyChain.validateKey(IL)) {
      // If left I value is >= N, then increase the 
      // buffer value by one digit, and try again.
      const incremented = KeyChain.increment(code)
      return KeyChain.create(key, incremented, path)
    }
    // Return each half of the hashed result in an array.
    return new KeyChain(IL, IR, path)
  }

  public static async import(
    fullpath : string,
  ) : Promise<KeyChain> {
    const [ chaincode, ...rest ] = fullpath.split('/')
    const bytes = Buff.hex(chaincode).toBytes()
    const key   = bytes.slice(0, 32)
    const code  = (bytes.length === 64)
      ? bytes.slice(33,64)
      : await sha256(key)
    let node = await KeyChain.create(key, code)
    for (const path of rest) {
      node = await node.derive(path)
    }
    return node
  }

  constructor(
    key  : Bytes,
    code : Bytes,
    path : string = '#'
  ) {
    this.key  = Buff.normalize(key)
    this.code = Buff.normalize(code)
    this.path = path
  }

  async derive(path : string) : Promise<KeyChain> {
    const nextpath = this.path + '/' + path
    return KeyChain.create(this.key, this.code, nextpath)
  }

  async resolve(fullpath : string) : Promise<KeyChain> {
    KeyChain.validatePath(fullpath)
    const [ start, ...rest ] = fullpath.split('/')
    let node = await this.derive(start)
    for (const path of rest) {
      node = await node.derive(path)
    }
    return node
  }
}
