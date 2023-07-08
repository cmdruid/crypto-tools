import { Buff } from '@cmdcode/buff-utils'
import { math } from '../src/index.js'

console.log(Buff.big(math.CONST.P, 32).hex)

// 'Error: Signature is invalid! 
// R: 0ff664a54e2ea4f5475969b753b899afb62ddc1c59fb16b8049f615824366c0c 
// r:327d3255179da8dd0e695f1882a19aea8faff4a84af1e540d85950cc4b3b340e'
