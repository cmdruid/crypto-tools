import { Buff, Bytes } from '@cmdcode/buff'
import { cbc, gcm }    from '@noble/ciphers/aes'

import * as assert from '../assert.js'

export function decrypt_cbc (
  payload : Bytes,
  secret  : Bytes,
  vector  : Bytes
) {
  const dat = Buff.bytes(payload)
  const sec = Buff.bytes(secret)
  const vec = Buff.bytes(vector)
  assert.size(vec, 16)
  const dec = cbc(sec, vec).decrypt(dat)
  return Buff.raw(dec)
}

export function encrypt_cbc (
  payload : Bytes,
  secret  : Bytes,
  vector  : Bytes
) {
  const dat = Buff.bytes(payload)
  const sec = Buff.bytes(secret)
  const vec = Buff.bytes(vector)
  assert.size(vec, 16)
  const enc = cbc(sec, vec).encrypt(dat)
  return Buff.raw(enc)
}

export function decrypt_gcm (
  payload : Bytes,
  secret  : Bytes,
  vector  : Bytes
) {
  const dat = Buff.bytes(payload)
  const sec = Buff.bytes(secret)
  const vec = Buff.bytes(vector)
  assert.size(vec, 12)
  const dec = gcm(sec, vec).decrypt(dat)
  return Buff.raw(dec)
}

export function encrypt_gcm (
  payload : Bytes,
  secret  : Bytes,
  vector  : Bytes
) {
  const dat = Buff.bytes(payload)
  const sec = Buff.bytes(secret)
  const vec = Buff.bytes(vector)
  assert.size(vec, 12)
  const enc = gcm(sec, vec).encrypt(dat)
  return Buff.raw(enc)
}
