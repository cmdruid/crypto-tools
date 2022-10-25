import * as secp from '@noble/secp256k1'
import * as ecdh from './ecdh.js'
import * as hash from './hash.js'

export default class Crypto {
  static ecdh = ecdh
  static hash = hash
  static secp = secp
}
