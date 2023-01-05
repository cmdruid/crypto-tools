import { Buff } from '@cmdcode/buff-utils'
import { KeyChain } from '../src/chain.js'

const key  = Buff.random(32).toHex()

const keychain = await KeyChain.create(key)

const node = await keychain.derive('bananas')

const supernode = await node.resolve('apples/and/carrots')

const imported = await KeyChain.import(key + '/this/is/a/test')

console.log(imported)