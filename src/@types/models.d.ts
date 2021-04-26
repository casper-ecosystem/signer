import { Keys } from 'casper-client-sdk';

interface KeyPairWithAlias {
  // Human readable alias.
  alias: string;
  KeyPair: Keys.AsymmetricKey;
}

type ByteArray = Uint8Array;
