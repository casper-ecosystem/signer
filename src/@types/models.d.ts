import { Keys } from 'casper-js-sdk';

interface KeyPairWithAlias {
  // Human readable alias.
  alias: string;
  keyPair: Keys.Ed25519 | Keys.Secp256K1;
  backedUp: boolean;
}

type ByteArray = Uint8Array;
