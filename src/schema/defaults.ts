import { SignerConfig } from './types.js'

export const SIGNER_DEFAULT : SignerConfig = {
  type   : 'schnorr',
  throws : false,
  xonly  : false
}
