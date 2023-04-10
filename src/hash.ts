import { webcrypto as crypto } from '@cmdcode/webcrypto'

import {
  Buff,
  Bytes,
  Data,
  sha256  as sha256sync,
  hash256 as hash256sync,
  hmac256 as hmac256sync
} from '@cmdcode/buff-utils'

import { KeyUtil }   from './utils.js'
import { ripemd160 } from './ripemd.js'

async function digest (
  bytes  : Bytes,
  format : string   = 'SHA-256',
  rounds : number   = 1,
  hook   : Function = (buff : ArrayBuffer) => buff
) : Promise<Uint8Array> {
  let i : number
  let buffer = (bytes instanceof ArrayBuffer)
    ? bytes
    : Buff.normalize(bytes).buffer
  for (i = 0; i < rounds; i++) {
    buffer = await crypto.subtle.digest(format, buffer)
    hook(buffer)
  }
  return new Uint8Array(buffer)
}

async function sha256 (bytes : Bytes) : Promise<Uint8Array> {
  return digest(bytes, 'SHA-256')
}

async function sha512 (bytes : Bytes) : Promise<Uint8Array> {
  return digest(bytes, 'SHA-512')
}

function ripe160 (bytes : Bytes) : Uint8Array {
  bytes = Buff.normalize(bytes)
  return ripemd160(bytes)
}

async function hash256 (bytes : Bytes) : Promise<Uint8Array> {
  return digest(bytes, 'SHA-256', 2)
}

async function hash160 (bytes : Bytes) : Promise<Uint8Array> {
  return ripe160(await sha256(bytes))
}

async function hmac256 (
  key  : Bytes,
  data : Bytes
) : Promise<Uint8Array> {
  const keyfile = await KeyUtil.hmac(key, 'SHA-256')
  return crypto.subtle
    .sign('HMAC', keyfile, Buff.normalize(data))
    .then((buffer) => new Uint8Array(buffer))
}

async function hmac512 (
  key  : Bytes,
  data : Bytes
) : Promise<Uint8Array> {
  const keyfile = await KeyUtil.hmac(key, 'SHA-512')
  return crypto.subtle
    .sign('HMAC', keyfile, Buff.normalize(data))
    .then((buffer) => new Uint8Array(buffer))
}

async function data (data : Data) : Promise<Uint8Array> {
  const buff = Buff.serialize(data)
  return sha256(buff).then(buff => new Uint8Array(buff))
}

export const Hash = {
  data,
  digest,
  ripe160,
  sha256,
  sha512,
  hash160,
  hash256,
  hmac256,
  hmac512,
  sync: {
    sha256  : sha256sync,
    hash256 : hash256sync,
    hmac256 : hmac256sync
  }
}
