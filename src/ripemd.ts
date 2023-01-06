// Copyright (c) 2021 Pieter Wuille
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

// Revised to Typescript.

type state = [bigint, bigint, bigint, bigint, bigint]

function bytesToBigInt (bytes : Uint8Array) : bigint {
  let num = 0n
  for (let i = bytes.length - 1; i >= 0; i--) {
    num = num * 256n + BigInt(bytes[i])
  }
  return BigInt(num)
}

function bigIntToBytes (num : bigint, size : number = 0) : Uint8Array {
  const bytes : bigint[] = []

  while (num > 0) {
    const byte = num & 0xffn
    bytes.push(byte)
    num = (num - byte) / 256n
  }

  let uint8 = Uint8Array.from(bytes.map((n) => Number(n)))

  if (size !== 0) {
    const resized = new Uint8Array(size)
    resized.set(uint8)
    uint8 = resized
  }

  return uint8
}

// Message schedule indexes for the left path.
const ML = [
  0n,
  1n,
  2n,
  3n,
  4n,
  5n,
  6n,
  7n,
  8n,
  9n,
  10n,
  11n,
  12n,
  13n,
  14n,
  15n,
  7n,
  4n,
  13n,
  1n,
  10n,
  6n,
  15n,
  3n,
  12n,
  0n,
  9n,
  5n,
  2n,
  14n,
  11n,
  8n,
  3n,
  10n,
  14n,
  4n,
  9n,
  15n,
  8n,
  1n,
  2n,
  7n,
  0n,
  6n,
  13n,
  11n,
  5n,
  12n,
  1n,
  9n,
  11n,
  10n,
  0n,
  8n,
  12n,
  4n,
  13n,
  3n,
  7n,
  15n,
  14n,
  5n,
  6n,
  2n,
  4n,
  0n,
  5n,
  9n,
  7n,
  12n,
  2n,
  10n,
  14n,
  1n,
  3n,
  8n,
  11n,
  6n,
  15n,
  13n
]

// Message schedule indexes for the right path.
const MR = [
  5n,
  14n,
  7n,
  0n,
  9n,
  2n,
  11n,
  4n,
  13n,
  6n,
  15n,
  8n,
  1n,
  10n,
  3n,
  12n,
  6n,
  11n,
  3n,
  7n,
  0n,
  13n,
  5n,
  10n,
  14n,
  15n,
  8n,
  12n,
  4n,
  9n,
  1n,
  2n,
  15n,
  5n,
  1n,
  3n,
  7n,
  14n,
  6n,
  9n,
  11n,
  8n,
  12n,
  2n,
  10n,
  0n,
  4n,
  13n,
  8n,
  6n,
  4n,
  1n,
  3n,
  11n,
  15n,
  0n,
  5n,
  12n,
  2n,
  13n,
  9n,
  7n,
  10n,
  14n,
  12n,
  15n,
  10n,
  4n,
  1n,
  5n,
  8n,
  7n,
  6n,
  2n,
  13n,
  14n,
  0n,
  3n,
  9n,
  11n
]

// Rotation counts for the left path.
const RL = [
  11n,
  14n,
  15n,
  12n,
  5n,
  8n,
  7n,
  9n,
  11n,
  13n,
  14n,
  15n,
  6n,
  7n,
  9n,
  8n,
  7n,
  6n,
  8n,
  13n,
  11n,
  9n,
  7n,
  15n,
  7n,
  12n,
  15n,
  9n,
  11n,
  7n,
  13n,
  12n,
  11n,
  13n,
  6n,
  7n,
  14n,
  9n,
  13n,
  15n,
  14n,
  8n,
  13n,
  6n,
  5n,
  12n,
  7n,
  5n,
  11n,
  12n,
  14n,
  15n,
  14n,
  15n,
  9n,
  8n,
  9n,
  14n,
  5n,
  6n,
  8n,
  6n,
  5n,
  12n,
  9n,
  15n,
  5n,
  11n,
  6n,
  8n,
  13n,
  12n,
  5n,
  12n,
  13n,
  14n,
  11n,
  8n,
  5n,
  6n
]

// Rotation counts for the right path.
const RR = [
  8n,
  9n,
  9n,
  11n,
  13n,
  15n,
  15n,
  5n,
  7n,
  7n,
  8n,
  11n,
  14n,
  14n,
  12n,
  6n,
  9n,
  13n,
  15n,
  7n,
  12n,
  8n,
  9n,
  11n,
  7n,
  7n,
  12n,
  7n,
  6n,
  15n,
  13n,
  11n,
  9n,
  7n,
  15n,
  11n,
  8n,
  6n,
  6n,
  14n,
  12n,
  13n,
  5n,
  14n,
  13n,
  13n,
  7n,
  5n,
  15n,
  5n,
  8n,
  11n,
  14n,
  14n,
  6n,
  14n,
  6n,
  9n,
  12n,
  9n,
  12n,
  5n,
  15n,
  8n,
  8n,
  5n,
  12n,
  9n,
  12n,
  5n,
  14n,
  6n,
  8n,
  13n,
  6n,
  5n,
  15n,
  13n,
  11n,
  11n
]

// K constants for the left path.
const KL = [0n, 0x5a827999n, 0x6ed9eba1n, 0x8f1bbcdcn, 0xa953fd4en]

// K constants for the right path.
const KR = [0x50a28be6n, 0x5c4dd124n, 0x6d703ef3n, 0x7a6d76e9n, 0n]

function fi (x : bigint, y : bigint, z : bigint, i : bigint) : bigint {
  // The f1, f2, f3, f4, and f5 functions from the specification.
  switch (true) {
    case i === 0n:
      return x ^ y ^ z
    case i === 1n:
      return (x & y) | (~x & z)
    case i === 2n:
      return (x | ~y) ^ z
    case i === 3n:
      return (x & z) | (y & ~z)
    case i === 4n:
      return x ^ (y | ~z)
    default:
      throw new TypeError('Unknown I value: ' + String(i))
  }
}

function rol (x : bigint, i : bigint) : bigint {
  // Rotate the bottom 32 bits of x left by i bits.
  return ((x << i) | ((x & 0xffffffffn) >> (32n - i))) & 0xffffffffn
}

function compress (
  h0 : bigint,
  h1 : bigint,
  h2 : bigint,
  h3 : bigint,
  h4 : bigint,
  block : Uint8Array
) : state {
  // Compress state (h0, h1, h2, h3, h4) with block.
  const x : bigint[] = []

  let rnd : bigint, elt : bigint, ert : bigint
  let ml : bigint, kl : bigint, mr : bigint, kr : bigint
  // Init left side of the array.
  let al = h0,
    bl = h1,
    cl = h2,
    dl = h3,
    el = h4
  // Init right side of the array.
  let ar = h0,
    br = h1,
    cr = h2,
    dr = h3,
    er = h4
  // Message variables.
  for (let i = 0; i < 16; i++) {
    const num = bytesToBigInt(block.slice(4 * i, 4 * (i + 1)))
    x.push(num)
  }
  // Iterate over the 80 rounds of the compression.
  for (let i = 0; i < 80; i++) {
    rnd = BigInt(i) >> 4n
    ml = x[Number(ML[i])]
    kl = KL[Number(rnd)]
    mr = x[Number(MR[i])]
    kr = KR[Number(rnd)]

    // Perform left side of the transformation.
    al = rol(al + fi(bl, cl, dl, rnd) + ml + kl, RL[i]) + el
    elt = el
    el = dl
    dl = rol(cl, 10n)
    cl = bl
    bl = al
    al = elt
    // Perform right side of the transformation.
    ar = rol(ar + fi(br, cr, dr, 4n - rnd) + mr + kr, RR[i]) + er
    ert = er
    er = dr
    dr = rol(cr, 10n)
    cr = br
    br = ar
    ar = ert
  }
  // Compose old state, left transform, and right transform into new state.
  return [h1 + cl + dr, h2 + dl + er, h3 + el + ar, h4 + al + br, h0 + bl + cr]
}

export function ripemd160 (bytes : Uint8Array) : Uint8Array {
  // Compute the RIPEMD-160 hash of data.

  // Initialize state.
  let state : state = [
    0x67452301n,
    0xefcdab89n,
    0x98badcfen,
    0x10325476n,
    0xc3d2e1f0n
  ]

  // Process full 64-byte blocks in the input.
  for (let b = 0; b < bytes.length >> 6; b++) {
    state = compress(...state, bytes.slice(64 * b, 64 * (b + 1)))
  }

  // Construct final blocks (with padding and size).
  const zfill : number[] = new Array((119 - bytes.length) & 63).fill(0)
  const pad : number[] = [0x80, ...zfill]
  const fin : Uint8Array = Uint8Array.from([
    ...bytes.slice(bytes.length & ~63),
    ...pad,
    ...bigIntToBytes(BigInt(8 * bytes.length), 8)
  ])

  // Process final blocks.
  for (let i = 0; i < fin.length >> 6; i++) {
    state = compress(...state, fin.slice(64 * i, 64 * (i + 1)))
  }

  // Produce output.
  const ret = []
  for (let i = 0; i < state.length; i++) {
    const num = state[i] & 0xffffffffn
    ret.push(...bigIntToBytes(num, 4))
  }

  return Uint8Array.from(ret)
}
