# Crypto Tools

Modern cryptography tools for the plebian developer.

Features:

```ts
import {
  ecdh,    // Basic tools for using the Elliptic-Curve Diffe-Hellman protocol.
  hash,    // Includes sha256, sha512, hmac, ripemd, tagged hashing, and more.
  hd,      // BIP-0032 based key derivation tool, with support for non-numeric paths.
  keys,    // A suite of tools for generating and tweaking secp256k1 key pairs.
  math,    // Bigint-based ecc math library, with added field and point arithmetic.
  signer,  // BIP-0340 'schnorr' based signing library with an extensive API.
  tree,    // A basic suite of tools for creating merkle trees and validating proofs.
  Field,   // A custom uint8 array class with built-in secp2561 field operations.
  Point    // A custom uint8 array class with built-in secp2561 point operations.
} from '@cmdcode/crypto-tools'
```

All methods are fully-typed and simple to use. More documentation coming soon!  

## How to Import

This library is designed to support classic and modern ESM imports, in both a nodejs and browser environment.

Example install via NPM or yarn:

```bash
npm  install @cmdcode/crypto-tools
yarn add     @cmdcode/crypto-tools
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
// Unpack tool from the main library.
import { signer } from '@cmdcode/crypto-tools'
// Unpack methods from tool.
const { sign_msg, verify_sig } = signer
// Unpack methods from the tool directly.
import { sign_msg, verify_sig } from '@cmdcode/crypto-tools/signer'
```

## ECDH Tool

Derive a shared secret from between two keys, using Elliptic-Curve Diffe-Hellman protocol.

```ts
import {
  get_shared_key   // Get the shared secret for a given secret / public key pairing.
  get_shared_code  // Use the derived secret to sign a message with HMAC-512.
} from '@cmdcode/crypto-tools/ecdh'
```

## Hash Tool

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
  digest,   // Hashes an array of data using BIP-0340 standards.
} from '@cmdcode/crypto-tools/hash'
```

Examples:

```ts
// Use the digest tool to create a BIP-0340 standard hash commitment.
const challenge = digest('BIP0340/challenge', sig, pubkey, msg)
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

## KeyPair Tools

Methods for working with cryptographic keys on the secp256k1 curve.

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

## Math Library

A bigint math library for performing arithmetic used in field and point operations.

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

A simplified data proofing system, compatible with nostr NIP-01 signed events.

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

## Field & Point

The `Field` and `Point` classes will convert a key or integer value into an object with a feature-rich API. This API is designed to perform complex elliptic curve operations, but in a simple and readable manner.

Each `Field` object is stored as raw bytes, and they are directly usable as an `Uint8Array`.

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

Each `Point` object is stored as a pair of X / Y bigint values on the secp256k1 curve.

```ts
import { Point } from '@cmdcode/crypto-tools/ecc'

const _pubkey  = Point.from_x(secret.point.raw)
const _twk_pub = pubkey.add(tweak)

console.log('imported point  :', _pubkey)
console.log('imported pubkey :', _pubkey.hex)
console.log('tweaked  pubkey :', _twk_pub.hex)
```

Here is simplified example of signing and verifing a BIP-0340 digital signature:

```ts
import { Field }  from '@cmdcode/crypto-tools/ecc'
import { digest } from '@cmdcode/crypto-tools/hash'
// Generate some hex strings to use as a secret key and message.
const message   = 'dead'.repeat(16)
const secret    = 'beef'.repeat(16)
// Compute the pubkey, nonce, and challenge values.
const pubkey    = Field.mod(secret).negated.point
const nonce     = digest('BIP0340/nonce', secret, pubkey.x, message)
const R_value   = Field.mod(nonce).negated.point
const challenge = digest('BIP0340/challenge', R_value.x, pubkey.x, message)
// Signature is composed of an R value and S value.
const s_value   = Field.mod(secret).negated.mul(challenge).add(nonce)
const r_value   = Field.mod(s_value).point.sub(pubkey.mul(challenge))
// Print the signature to console and report its validity.
console.log('signature :', R_value.x.hex + s_value.hex)
console.log('is valid  :', R_value.hex === r_value.hex)
```

```ts
import { Field, Point } from '@cmdcode/crypto-tools/ecc'
// Fields can be created from a variety of types (strings are treated as hex).
type FieldValue = string | number | bigint | Uint8Array | Field
// Points can be created from a variety of types (strings are treated as hex).
type PointValue = string | number | bigint | Uint8Array | Point
// The Field class is an extension of the uint8 data type.
class Field extends Uint8Array {
  // Prime N reference.
  static N: bigint
  // Helper method for efficient modulo operations.
  static mod(x: bigint, n?: bigint): bigint
  // Helper method for efficient power operations.
  static pow(x: bigint, e: bigint, n?: bigint): bigint
  // Normalize input values into bytes.
  static normalize(num: FieldValue): Uint8Array
  // Validate input values (or throw).
  static validate(num: bigint): boolean;

  // Accepts a variety of inputs.
  constructor(x : FieldValue);

  // Convert into a variety of formats.
  get buff()    : Buff;
  get raw()     : Uint8Array;
  get big()     : bigint;
  get hex()     : string;

  // Return point (or x-only point) object.
  get point()   : Point;
  get xpoint()  : Point;

  // Helper attributes.
  get hasOddY() : boolean;
  get negated() : Field;

  // All basic operations are available.
  gt(big: FieldValue)  : boolean;
  lt(big: FieldValue)  : boolean;
  eq(big: FieldValue)  : boolean;
  ne(big: FieldValue)  : boolean;
  add(big: FieldValue) : Field;
  sub(big: FieldValue) : Field;
  mul(big: FieldValue) : Field;
  pow(big: FieldValue) : Field;
  div(big: FieldValue) : Field;
  negate()             : Field;
  generate()           : Point;
}
// The Point class stores the x / y coordinates of a point on the secp256k1 curve.
class Point {
  // Prime N reference.
  static N: bigint;

  // Validate input values (or throw).
  static validate(x: PointValue): boolean;

  // Normalize input values into bytes.
  static normalize(x: PointValue): ECPoint;
  
  // Generate a point from a field (scalar) value.
  static generate(value: FieldValue): Point;

  // Helper method for importing coordinates.
  static import(point: Point | ECPoint): Point;

  // Accepts a varity of x-only and compressed key inputs.
  // Will also accept coordinate data (as bigint). 
  constructor(x: PointValue, y?: bigint);

  // Convert into a variety of formats.
  get p()    : ECPoint;
  get x()    : Buff;
  get y()    : Buff;
  get buff() : Buff;       // Returns compressed key.
  get raw()  : Uint8Array; // Returns compressed key.
  get hex()  : string;     // Returns compressed key.

  // Helper attributes.
  get hasEvenY(): boolean;
  get hasOddY(): boolean;

  // Basic math operations available.
  eq(value: PointValue): boolean;
  add(x: PointValue): Point;
  sub(x: PointValue): Point;
  mul(value: PointValue): Point;
  negate(): Point;
}
```

## Development / Testing

This library uses yarn for package management, tape for writing tests, and rollup for cross-platform releases. Here are a few scripts that are useful for development.

```bash
## Performs a basic stress test for benchmarking performance.
yarn bench
## Compiles types and builds a new release in /dist folder.
yarn build
## Runs linting rules using ESLint and Typescript.
yarn limt
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
