import hashVectors from './hash.vectors.js'

const ec = new TextEncoder()

function bytesToHex(bytes) {
  // Basic conversion of a byte array into a hex string.
  const hex = []
  let i
  for (i = 0; i < bytes.length; i++) {
    hex.push(bytes[i].toString(16).padStart(2, '0'))
  }
  return hex.join('')
}

export default function (t, f) {
  const vectors = hashVectors.ripe160
  const testCount = vectors.length

  t.plan(testCount)
  for (let [src, target] of vectors) {
    const res = bytesToHex(f(ec.encode(src)))
    t.equal(target, res)
  }
}
