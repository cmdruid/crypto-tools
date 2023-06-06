import { safeThrow } from '../utils.js'

interface ValidatorConfig {
  label  : string
  throws : boolean
}

const FIELD_SIZE  = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2Fn
const CURVE_ORDER = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141n

export function isValidField (
  value  : bigint,
  config : Partial<ValidatorConfig> = {}
) : boolean {
  const { label = 'key', throws = false } = config

  // Fail if r > p (field size).
  if (value > FIELD_SIZE) {
    return safeThrow(`${label} value greater than field size!`, throws)
  }

  if (value < 0n) {
    return safeThrow(`${label} value is negative!`, throws)
  }

  if (value === 0n) {
    return safeThrow(`${label} value is zero!`, throws)
  }

  return true
}

export function isValidPoint (
  value  : bigint,
  config : Partial<ValidatorConfig> = {}
) : boolean {
  const { label = 'key', throws = false } = config

  // Fail if r > p (field size).
  if (value > CURVE_ORDER) {
    return safeThrow(`${label} value outside curve order!`, throws)
  }

  if (value < 0n) {
    return safeThrow(`${label} value is negative!`, throws)
  }

  if (value === 0n) {
    return safeThrow(`${label} value is zero!`, throws)
  }

  return true
}
