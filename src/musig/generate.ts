import { Buff, Bytes }  from '@cmdcode/buff-utils'
import { SignerConfig } from '@/schema/types'

function generate_nonce (
  secret  : Bytes,
  message : Bytes,
  pubkeys : Bytes[],
  options : Partial<SignerConfig> = {}
) : {
  sec_nonce : Bytes
  pub_nonce : Bytes
} | undefined {
  const rand = Buff.random()
  return
}

