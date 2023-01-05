import { Bytes } from '@cmdcode/buff-utils'
import { KeyChain }    from './chain'
import { KeyPair }     from './ecc'
import { Signer } from './signer'

export class KeyRing extends KeyPair {

  private readonly chain : Promise<KeyChain>

  constructor(
    secret : Bytes
  ) {
    super(secret)
    this.chain = KeyChain.create(secret)
  }

  get signer() : Signer | undefined {
    return (this.privateKey[0] === 0) 
      ? new Signer(this.privateKey.slice(1,33))
      : undefined
  }

  async derive(path : string) : Promise<KeyChain> {
    return (await this.chain).derive(path)
  }

  async privateRing(path : string) : Promise<KeyRing> {
    const { key } = await this.derive(path)
    const secret  = this.field.add(key)
    return new KeyRing(secret)
  }

  async publicRing(path : string) : Promise<KeyRing> {
    const { key } = await this.derive(path)
    const secret  = this.field.point.add(key).rawX
    return new KeyRing(secret)
  }
}
