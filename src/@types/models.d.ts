interface SignKeyPairWithAlias {
  // Human readable name.
  name: string;
  signKeyPair: nacl.SignKeyPair;
}

type ByteArray = Uint8Array;
