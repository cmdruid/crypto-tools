export interface PointData { x : bigint, y : bigint }

export interface ExtendedKey {
  prefix : number
  depth  : number
  fprint : number
  index  : number
  code   : string
  type   : number
  key    : string
}
