import { Bytes }  from '@cmdcode/buff-utils'
import { Field, Point } from '../ecc.js'
import { KeyContext }   from './types.js'

export function apply_tweak (
  tweak   : Bytes,
  context : KeyContext,
  xonly   : boolean = false
) : KeyContext {
  const { qacc, gacc, tacc } = context

  const t = new Field(tweak)
  const T = t.point
  const Q = new Point(qacc)
  const g = (xonly && Q.hasOddY) ? Field.mod(-1n) : 1n

  if (t.big >= Field.N) {
    throw new Error('Tweak outside field range!')
  }

  console.log('negN:', Field.mod(-1n))

  const Qg = Q.mul(g)
  const QT = Qg.add(T)

  if (QT.x.big === 0n) {
    throw new Error('Key is at infinity!')
  }

  return {
    qacc : QT.raw,
    gacc : Field.mod(g * gacc),
    tacc : t.add(g * tacc).big
  }
}
