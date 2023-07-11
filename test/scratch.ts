import { derive, parse_keystr } from '../src/derive.js'
import KeyLink    from '@cmdcode/keylink'

const path = "m/0/2147483647'/1/2147483646'/2"

const key  = 'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542'

const [ new_key, new_code ] = derive(path, key)

console.log(parse_keystr('xprvA2nrNbFZABcdryreWet9Ea4LvTJcGsqrMzxHx98MMrotbir7yrKCEXw7nadnHM8Dq38EGfSh6dqA9QWTyefMLEcBYJUuekgW4BYPJcr9E7j'))

console.log(
  new_key.hex,
  new_code.hex
)
