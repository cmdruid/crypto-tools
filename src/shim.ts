import nodelib from 'crypto'

export const crypto = (typeof window !== 'undefined') 
  ? window.crypto
  : nodelib.webcrypto
