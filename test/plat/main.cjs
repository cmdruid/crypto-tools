const { keys, util } = require('../../dist/main.cjs')

const secret = util.random(32)
const [ sec, pub ] = keys.get_keypair(secret, true)

console.log('seckey:', sec.hex)
console.log('pubkey:', pub.hex)
