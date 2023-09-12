# crypto-tools

A modern suite of cryptography tools, built for the plebian developer.

* All tools are written in typescript and simple to use.
* Methods return a [Buff](https://github.com/cmdruid/buff) object for quick conversion between formats.
* Library works in both node and the browser.
* Uses the well-audited [@noble/curves](https://github.com/paulmillr/noble-curves) library for fast ecc operations.

```ts
import {
  ecdh,    // Basic methods for using the Elliptic-Curve Diffe-Hellman protocol.
  hash,    // Includes sha256, sha512, hmac, ripemd, tagged hashing, and more.
  hd,      // BIP-0032 based key derivation tool, with support for non-numeric paths.
  keys,    // A suite of tools for generating and tweaking secp256k1 key pairs.
  math,    // Bigint-based ecc math library, with added field and point arithmetic.
  signer,  // BIP-0340 'schnorr' based signing library with an extensive API.
  tree,    // A basic suite of tools for creating merkle trees and validating proofs.
  Field,   // A feature-rich uint8 array class with built-in math operations.
  Point    // A secp2561 point object with built-in math operations.
} from '@cmdcode/crypto-tools'
```

More documentation coming soon!  

## How to Import

This library is designed to support classic and modern ESM imports, in both a nodejs and browser environment.

Example install via NPM or yarn:

```bash
npm install @cmdcode/crypto-tools || yarn add @cmdcode/crypto-tools
```

Classic import into a nodejs project:

```ts
const { Field, Point } = require('@cmdcode/crypto-tools')
```

Modern import into an nodejs project:

```ts
import { Field, Point } from '@cmdcode/crypto-tools'
```

Classic import into a browser-based project:

```html
<script src="https://unpkg.com/@cmdcode/crypto-tools"></script>
<script>
  const { Field, Point } = window.crypto_tools
</script>
```

Modern import into a browser-based project:

```html
<script type="module">
  import { Field, Point } from "https://unpkg.com/@cmdcode/crypto-tools/dist/module.mjs" 
</script>
```

## How to Use

This suite is made up of individual tools.

Each tool can be unpacked from the main library, or imported and unpacked directly.

```ts
// Import tool from main library, then unpack methods.
import { signer } from '@cmdcode/crypto-tools'
const { sign_msg, verify_sig } = signer
// Import methods from the tool directly.
import { sign_msg, verify_sig } from '@cmdcode/crypto-tools/signer'
```

Many methods will accept a `Bytes` value type, and return a `Buff` object. The `Bytes` type covers any data type that can be converted into raw bytes.

```ts
type Bytes = string | number | bigint | Uint8Array | Buff
```

`Buff` works in place of a standard `Uint8Array` and offers a number of quick convertion methods.

```ts
const seckey = get_seckey('deadbeef'.repeat(4))
console.log('secret raw :', seckey)
console.log('secret hex :', seckey.hex)
console.log('secret big :', seckey.big)
```

You can read more about the `Buff` API [here](https://github.com/cmdruid/buff).

### ECDH Tool

Derive a shared secret from between two keys, using Elliptic-Curve Diffe-Hellman protocol.

```ts
import {
  get_shared_key   // Get the shared secret for a given secret / public key pairing.
  get_shared_code  // Use the derived secret to sign a message with HMAC-512.
} from '@cmdcode/crypto-tools/ecdh'
```

### Hash Tool

Used for performing SHA-256, SHA-512, HMAC-256, HMAC-512, and other useful hashing methods.

```ts
import {
  sha256,   // Uses standard SHA-256 algorithm.
  sha512,   // Uses standard SHA-512 algorithm.
  ripe160,  // Uses RIPEMD-160 algorithm.
  hash160,  // A double-hash algorithm used in bitcoin.
  hash256,  // A double-hash algorithm used in bitcoin.
  hmac256,  // Hash and sign a message using HMAC and SHA-256.
  hmac512,  // Hash and sign a message using HMAC and SHA-512.
  taghash,  // Creates a BIP-0340 standard 'tag' hash.
  hash340,  // Hashes an array of data using BIP-0340 standards.
} from '@cmdcode/crypto-tools/hash'
```

Examples:

```ts
// Each hash tool can accept many byte-compatible values.
const hash = sha256('fda0', 1024n, new Uint8Array(0), 42)
// Use the taghash tool to create a BIP-0340 standard hash commitment.
const challenge = hash340('BIP0340/challenge', sig, pubkey, msg)
```

## HD Tool

Generate a pair of keys from a BIP-0032 style derivation path.

```ts
import {
  derive_key,     // Derive a key-pair using a BIP-0032* path of deterministic key tweaks.
  parse_tweaks,   // Helper method to convert a derivation path into an array of tweaks.
  generate_code,  // Generator method used to create the hash-chain.
  encode_extkey   // Export a derived key-pair as a base58-encoded extended key.
  parse_extkey    // Parse a base58-encoded extended key into its keys and meta-data.
  derive_extkey   // Parse an extended key, then use a path to derive a child key-pair.
} from '@cmdcode/crypto-tools/hd'
```

> Note : The derivation tool also supports using non-numeric characters in the derivation path.

Examples:

```ts
import { derive_key, encode_extkey } from '@cmdcode/crypto-tools/hd'
// Define some sample data.
const seed = 'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542'
const path = "m/0/2147483647'/1/2147483646'/2"
// Derive the key using the seed and derivation path.
const key_data = derive_key(path, seed)
// Resulting key data:
console.log('link:', key_data)
link: {
  seckey : 'bb7d39bdb83ecf58f2fd82b6d918341cbef428661ef01ab97c28a4842125ac23',
  pubkey : '024d902e1a2fc7a8755ab5b694c575fce742c48d9ff192e63df5193e4c7afe1f9c',
  code   : '9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271',
  path   : "m/0/2147483647'/1/2147483646'/2",
  prev   : '02d2b36900396c9282fa14628566582f206a5dd0bcc8d5e892611806cafb0301f0'
}
// You can convert the key data into a base58 extended key.
const extkey = encode_extkey(keylink)
// Resulting extkey:
'extkey : xprvA2nrNbFZABcdryreWet9Ea4LvTJcGsqrMzxHx98MMrotbir7yrKCEXw7nadnHM8Dq38EGfSh6dqA9QWTyefMLEcBYJUuekgW4BYPJcr9E7j'
```

## KeyPair Tools

Methods for working with key pairs on the secp256k1 curve.

```ts
import {
  get_seckey,     // Convert a number or byte value into a secp256k1 secret key.
  get_pubkey,     // Generate a secp256k1 public key for a given secret key.
  tweak_seckey,   // Apply an array of additional tweaks to a secret key.
  tweak_pubkey,   // Apply an array of additional tweaks to a public key.
  gen_seckey,     // Generate a random secret key (using Web Crypto API).
  negate_seckey,  // Perform a field negation operation on a secret key.
  gen_keypair,    // Generate a secp256k1 secret and public key pair.
  get_keypair,    // Convert a number or byte value into a secp256k1 key pair.
  convert_32b,    // Convert any public key into a 32-byte x-only key.
  convert_33b,    // Convert any public key into a 33-byte compressed key.
} from '@cmdcode/crypto-tools/keys'
```

Examples:

```ts
import { gen_seckey, get_pubkey } from '../src/keys.js'
// Configure a demo keypair and message.
const seckey = gen_seckey()
const pubkey = get_pubkey(seckey, true)
console.log('seckey:', seckey.hex)
console.log('pubkey:', pubkey.hex)
```

## Math Library

A bigint math library for performing arithmetic and field / point operations.

```ts
import {
  fd,         // Perform various modulo arithmetic using secp256k1 field order N.
  pt,         // Perform various point operations using secp256k1 field order P.
  mod,        // Apply a modulo for a bigint value.
  mod_n,      // Apply modulo N for a bigint value.
  mod_p,      // Apply modulo P for a bigint value.
  pow,        // Raise a number to a given power.
  pow2,       // Raise a number 2x to a given power.
  pow_n,      // Raise a number to a given power, modulo N.
  sqrt_n,     // Perform a square root operation on a bigint value, modulo N.
  sqrt_p,     // Perfrom a aquare root operation on a bigint value, modulo P.
  invert,     // Invert / negate a bigint field value.
  mod_bytes,  // Perform a modulo operation on a byte value.
  in_field,   // Check if a number is within the secp256k1 field order N.
  on_curve    // Check if a number is within the secp256k1 curve order P.
} from '@cmdcode/crypto-tools/math'
```

## Proofing Tools

A simplified data proofing system, compatible with Nostr NIP-01 signed events.

```ts
import {
  create_proof,    // Create a compact signature proof.
  parse_proof,     // Parse a compact proof into JSON.
  validate_proof,  // Validate the schema of a proof.
  verify_proof,    // Verify the hash and signature of a proof.
  create_event,    // Convert a proof into a NIP-01 nostr note.
  parse_config     // Parse the proof configuration from params.
} from '@cmdcode/crypto-tools/proof'
```

Examples:

```ts
// Setup a demo keypair and message.
const [ seckey, pubkey ] = gen_keypair()
// Create a proof.
const data   = { name : 'bob', key : 'abcd' }
const stamp  = Math.floor(Date.now() / 1000)
const params = [[ 'kind', 10000 ], [ 'stamp', stamp ]]
const proof  = create_proof(seckey, data, params)
console.log(proof)
`e403621bae6dffd75c76b282cc3525da14bf55a4ee3c396279f35f766b4ad079749b45be02446dc32e4eab02be026eef1592a23c209eb8b571f4f78ac6a762405cc802eae19177096334c0d4e53add9c97dc200e3f2e5700bd17aee14beb01e983456c5cb3461f20c8f3d59e8386a0d8ad4c3d6f58cacb9fc85eef514b8fc1007c476558535de220aebc916b0974e8b76dd584ba14b479d947f9ee52c40333c8?kind=10000&stamp=1694095593`
// Verify a proof
const is_valid = verify_proof(proof, data)
console.log('is_valid:', is_valid)
`is_valid : true`
// Parse a proof into a ProofData object
const proof_data = parse_proof(proof)
console.log('proof data:', proof_data)
proof data: {
  ref: 'e403621bae6dffd75c76b282cc3525da14bf55a4ee3c396279f35f766b4ad079',
  pub: '749b45be02446dc32e4eab02be026eef1592a23c209eb8b571f4f78ac6a76240',
  pid: '5cc802eae19177096334c0d4e53add9c97dc200e3f2e5700bd17aee14beb01e9',
  sig: '83456c5cb3461f20c8f3d59e8386a0d8ad4c3d6f58cacb9fc85eef514b8fc1007c476558535de220aebc916b0974e8b76dd584ba14b479d947f9ee52c40333c8',
  params: [ [ 'kind', '10000' ], [ 'stamp', '1694095593' ] ]
}
// Convert a proof into a nostr note.
const event = create_event(proof, data)
console.log('event:', event)
event: {
  kind: 10000,
  content: '{"name":"bob","key":"abcd"}',
  tags: [],
  pubkey: '749b45be02446dc32e4eab02be026eef1592a23c209eb8b571f4f78ac6a76240',
  id: '5cc802eae19177096334c0d4e53add9c97dc200e3f2e5700bd17aee14beb01e9',
  sig: '83456c5cb3461f20c8f3d59e8386a0d8ad4c3d6f58cacb9fc85eef514b8fc1007c476558535de220aebc916b0974e8b76dd584ba14b479d947f9ee52c40333c8',
  created_at: 1694095593
}
```

## Signature Tools

A basic signing tool for working with BIP-0340 'schnorr' based digital signatures.

```ts
import {
  sign_msg,    // Sign a message using BIP-0340 standard.
  verify_sig,  // Verify a BIP-0340 signature, key and, message.
  gen_nonce,   // Generate a nonce for a given message.
  recover_key  // Recover the secret key from a signature using ECDH recovery.
} from '@cmdcode/crypto-tools/signer'
```

The `sign_msg`, `verify_msg`, and `gen_nonce` methods are configurable through an options object:

```ts
export interface SignConfig {
  // Specify the aux data to use as a seed. Default is random.
  aux          ?: Bytes | null
  // Apply an adaptor tweak to the nonce value.
  adaptors     ?: Bytes[]
  // Apply tweaks to the nonce value during generation.
  nonce_tweaks ?: Bytes[]
  // Specify a public key to be used in ECDH key recovery.
  recovery_key ?: Bytes
  // Apply tweaks to the signature value during signing.
  key_tweaks   ?: Bytes[]
  // If validation fails, throw an error instead of returning false.
  throws        : boolean
  // If keys used during the signing operation should be negated for even-ness.
  xonly         : boolean
}
```
Examples:

```ts
import { gen_keypair }          from '../src/keys.js'
import { sign_msg, verify_sig } from '../src/sig.js'
// Configure a demo keypair and message.
const [ seckey, pubkey ] = gen_keypair(true)
const message  = 'abcd1234'.repeat(4)
// Sign the message, then validate the signature.
const sig      = sign_msg(message, seckey)
const is_valid = verify_sig(sig, message, pubkey)
// Check the console output.
console.log('signature:', sig.hex)
console.log('is_valid:', is_valid)
```

Key recovery allows you to designate another key-pair that can recover your private key from a signature, using ECDH.

```ts
// Configure two pairs of keys and a test message.
const [ hot_sec, hot_pub ]   = gen_keypair(true)
const [ cold_sec, cold_pub ] = gen_keypair(true)
const message = 'feedcab123'
// Sign a message with the 'cold' pubkey as an ECDH recovery key.
const sig = sign_msg(message, hot_sec, { recovery_key: cold_pub })
```

Under the hood, key recovery will modify the nonce generation so that an ECDH shared secret is used instead of your private key.

```ts
// Normal BIP-0340 nonce generation.
let sec_nonce  = taghash('BIP0340/nonce', seckey, pubkey, message)
// Modified nonce generation for ECDH key recovery:
let shared_key = ecdh.get_shared_key(seckey, rec_pubkey)
    sec_nonce  = hash340('BIP0340/nonce', shared_key, pubkey, message)
```

This allows the 'cold' seckey to compute the shared secret, and thus extract the 'hot' seckey from the signature.

```ts
// Use the signature and 'cold' seckey to recovery the secret key.
const rec_key = recover_key(sig, message, hot_pub, cold_sec)
// The recovered 'hot' seckey will be negated, so we will also negate 
// the original key in order to compare it with the recovered key.
console.log('recovered key  :', rec_key.hex)
`recovered key  : c18d25e25c1b229d14bd97e0daf3e4453765c2e007d9023698458573517ccd55`
console.log('hot secret key :', get_seckey(hot_sec, true).hex)
`hot secret key : c18d25e25c1b229d14bd97e0daf3e4453765c2e007d9023698458573517ccd55`
```

The formula for recovering a secret key via ECDH shared secret signing:

```ts
R_value   = sig.slice(0, 32)
s_value   = sig.slice(32, 64)
sec_nonce = hash340('BIP0340/nonce', shared_key, pubkey, message)
challenge = hash340('BIP0340/challenge', R_value, pubkey, message)
sec_key   = (s_value - sec_nonce) / challenge
```

## Field

The `Field` class will convert a key or integer value into a field value under the secp256k1 curve. This field value includes a built-in API for performing math operations in a simple and readable manner.

Each `Field` object is stored as raw bytes, and they are directly usable as an `Uint8Array`.

**Example:**

```ts
import { Field } from '@cmdcode/crypto-tools/ecc'

const seed    = 'dead'.repeat(16)
const tweak   = 'beef'.repeat(16)
const secret  = Field.mod(seed)
const pubkey  = secret.point
const twk_sec = secret.add(tweak)
const twk_pub = twk_sec.point

console.log('original seckey :', secret.hex)
console.log('original pubkey :', pubkey.hex)
console.log('tweaked seckey  :', twk_sec.hex)
console.log('tweaked pubkey  :', twk_pub.hex)
```

Documentation for the `Field` API:

```ts
// Fields can be created from a variety of types (strings are treated as hex).
type FieldValue = string | number | bigint | Uint8Array | Field

// The Field class is an extension of the uint8 data type.
class Field extends Uint8Array {
  // Prime N reference.
  static N: bigint
  // Converts a value under secp256k1 field order N. Same as new Field(x).
  static mod(x: bigint, n?: bigint): bigint
  // Normalize input values into bytes.
  static normalize(num: FieldValue): Uint8Array
  // Checks if value is within the secp256k1 field order N.
  static is_valid(num: bigint): boolean
  // Convert into a variety of formats.
  get buff    : Buff
  get raw     : Uint8Array
  get big     : bigint
  get hex     : string
  // Return point object.
  get point   : Point
  // Checks if the point value of the field has an odd y coordinate.
  get hasOddY : boolean
  // Auto-negates the field value if it has an odd y coordiante.
  get negated : Field
  // All basic operations are available.
  gt  (big: FieldValue) : boolean
  lt  (big: FieldValue) : boolean
  eq  (big: FieldValue) : boolean
  ne  (big: FieldValue) : boolean
  add (big: FieldValue) : Field
  sub (big: FieldValue) : Field
  mul (big: FieldValue) : Field
  pow (big: FieldValue) : Field
  div (big: FieldValue) : Field
  negate()              : Field
  generate()            : Point
}
```

## Point

The `Point` class will convert a key or integer value into a point value under the secp256k1 curve. This point value includes a built-in API for performing math operations in a simple and readable manner.

Each `Point` object contains an `x` coordiante and a `y` coordinate, stored as bigint values.

**Example:**

```ts
import { Point } from '@cmdcode/crypto-tools/ecc'

const _pubkey  = Point.from_x(secret.point.raw)
const _twk_pub = pubkey.add(tweak)

console.log('imported point  :', _pubkey)
console.log('imported pubkey :', _pubkey.hex)
console.log('tweaked  pubkey :', _twk_pub.hex)
```

Documentation for the `Point` API:

```ts
// Points can be created from a variety of types (strings are treated as hex).
type PointValue = string | number | bigint | Uint8Array | Point
// The Point class stores the x / y coordinates of a point on the secp256k1 curve.
class Point {
  // Prime N reference.
  static P : bigint
  static G : Point
  // Create a point from an existing compressed key.
  static from_x(x: PointValue, xonly ?: boolean) : Point
  // Generate a point from a field (scalar) value.
  static generate(value: FieldValue) : Point
  // Helper method for importing points from Noble library.
  static import(point: Point | ECPoint) : Point
  // Accepts a varity of x-only and compressed key inputs.
  // Will also accept coordinate data (as bigint). 
  constructor (x: PointValue, y?: bigint)
  // Convert into a variety of formats.
  get x        : Buff       // Return a buff object.
  get y        : Buff       // Return a buff object.
  get buff     : Buff       // Returns compressed key as bytes.
  get hex      : string     // Returns compressed key as hex.
  get hasEvenY : boolean
  get hasOddY  : boolean
  // Auto-negates the point value if it has an odd y coordiante.
  get negated  : Point
  // Basic math operations available.
  eq  (value: PointValue) : boolean
  add (x: PointValue)     : Point
  sub (x: PointValue)     : Point
  mul (value: PointValue) : Point
  negate(): Point;
}
```

A `Point` can also be generated from a `Field` object, allowing you to perform complex elliptic curve operations using mostly the `Field` class.

Here is simplified example of signing and verifing a BIP-0340 digital signature, using the `Field` class:

```ts
import { Field }  from '@cmdcode/crypto-tools/ecc'
import { digest } from '@cmdcode/crypto-tools/hash'
// Generate some hex strings to use as a secret key and message.
const message   = 'dead'.repeat(16)
const secret    = 'beef'.repeat(16)
// Compute the pubkey, nonce, and challenge values.
const pubkey    = Field.mod(secret).negated.point
const nonce     = hash340('BIP0340/nonce', secret, pubkey.x, message)
const R_value   = Field.mod(nonce).negated.point
const challenge = hash340('BIP0340/challenge', R_value.x, pubkey.x, message)
// Signature is composed of an R value and S value.
const s_value   = Field.mod(secret).negated.mul(challenge).add(nonce)
const r_value   = Field.mod(s_value).point.sub(pubkey.mul(challenge))
// Print the signature to console and report its validity.
console.log('signature :', R_value.x.hex + s_value.hex)
console.log('is valid  :', R_value.hex === r_value.hex)
```

## Development / Testing

This library uses yarn for package management, tape for writing tests, and rollup for cross-platform releases. Here are a few scripts that are useful for development.

```bash
## Performs a basic stress test for benchmarking performance.
yarn bench
## Compiles types and builds a new release in /dist folder.
yarn build
## Runs linting rules using ESLint and Typescript.
yarn lint
## Runs all TAP tests from the test/src folder.
yarn test
## Full script for generating a new release candidate.
yarn release
```

## Bugs / Issues

If you run into any bugs or have any questions, please submit an issue ticket.

## Contribution

Feel free to fork and make contributions. Suggestions are welcome!

## License

Use this library however you want!
