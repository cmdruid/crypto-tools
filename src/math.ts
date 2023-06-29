const _0n = BigInt(0)
const _1n = BigInt(1)

export function mod (a : bigint, b : bigint) : bigint {
  const result = a % b
  return result >= _0n ? result : b + result
}

export function floor (a : bigint, b : bigint) : bigint {
  return a / b
}

export function pow (
  num : bigint,
  exp : bigint,
  modulo ?: bigint
) : bigint {
  const is_mod = (typeof modulo === 'bigint')
  switch (true) {
    case (exp < _0n):
      throw new Error('Exponent must be greater than zero.')
    case (is_mod && modulo < _1n):
      throw new Error('Modulo must be greater than zero.')
    case (is_mod && modulo === _1n):
      return _0n
    default:
      break
  }

  let ans = _1n

  while (exp > _0n) {
    if ((exp & _1n) === _1n) {
      ans *= num
      ans = is_mod ? mod(ans, modulo) : ans
    }
    num *= num
    num = is_mod ? mod(num, modulo) : num
    exp >>= _1n
  }
  return ans
}
