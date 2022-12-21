import { genKeyPair } from '../src/keys.js'

let counter = 0

while (counter < 1000) {
  const key = genKeyPair()
  if (key.privateKey.length !== 32) {
    console.log(key.privateKey)
    console.log(counter)
    break
  }
  counter ++
}