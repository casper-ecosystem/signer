import { action, computed } from 'mobx';
import passworder from 'browser-passworder';
import store from 'store';
import * as nacl from 'tweetnacl';
import { encodeBase16, decodeBase16, Keys } from 'casper-client-sdk';
import { AppState } from '../lib/MemStore';
import { KeyPairWithAlias } from '../@types/models';

export interface SerializedSignKeyPairWithAlias {
  name: string;
  signKeyPair: {
    publicKey: string; // hex encoded
    secretKey: string; // hex encoded
  };
}

interface PersistentVaultData {
  userAccounts: SerializedSignKeyPairWithAlias[];
  selectedUserAccount: SerializedSignKeyPairWithAlias | null;
}

class AuthController {
  // we store the salted password hash instead of original password
  private passwordHash: string | null = null;
  private passwordSalt: Uint8Array | null = null;

  // we will use the passwordHash above to encrypt the value object
  // and then using this key to store it in local storage along with
  // the plain text salt for the password.
  private encryptedVaultKey = 'encryptedVault';
  private saltKey = 'passwordSalt';

  constructor(private appState: AppState) {
    if (this.getStoredValueWithKey(this.encryptedVaultKey) !== null) {
      this.appState.hasCreatedVault = true;
    }
  }

  @action.bound
  async createNewVault(password: string): Promise<void> {
    if (this.getStoredValueWithKey(this.encryptedVaultKey) !== null) {
      throw new Error('There is a vault already');
    }
    let [salt, saltedPassword] = this.saltPassword(password);
    let hash = this.hash(saltedPassword);
    this.passwordSalt = salt;
    this.passwordHash = hash;
    await this.clearAccount();
    await this.persistVault();
    this.appState.hasCreatedVault = true;
    this.appState.isUnlocked = true;
  }

  @action
  switchToAccount(accountName: string) {
    let i = this.appState.userAccounts.findIndex(a => a.alias === accountName);
    if (i === -1) {
      throw new Error(
        "Couldn't switch to this account because it doesn't exist"
      );
    }
    this.appState.selectedUserAccount = this.appState.userAccounts[i];
  }

  getSelectUserAccount(): SerializedSignKeyPairWithAlias {
    if (!this.appState.selectedUserAccount) {
      throw new Error('There is no active key');
    }
    return this.serializeKeyPairWithAlias(this.appState.selectedUserAccount);
  }

  @action
  async resetVault() {
    await this.clearAccount();
    this.appState.selectedUserAccount = null;
    this.appState.unsignedDeploys.clear();
    this.appState.hasCreatedVault = false;
    store.remove(this.encryptedVaultKey);
  }

  @action
  async importUserAccount(name: string, secretKeyHex: string) {
    if (!this.appState.isUnlocked) {
      throw new Error('Unlock it before adding new account');
    }

    let account = this.appState.userAccounts.find(account => {
      return (
        account.alias === name ||
        encodeBase16(account.KeyPair.privateKey) === secretKeyHex
      );
    });

    if (account) {
      throw new Error(
        `A account with same ${
          account.alias === name ? 'name' : 'secret key'
        } already exists`
      );
    }

    const secretKeyBytes = decodeBase16(secretKeyHex);
    let publicKeyBytes;
    let keyPair;

    /**
     * TODO: How to discern algorithm from secret key?
     * Both Ed25519 and Secp256k1 are 32 bytes.
     */

    switch (secretKeyHex.substring(0, 2)) {
      case '01':
        publicKeyBytes = Keys.Ed25519.privateToPublicKey(secretKeyBytes);
        keyPair = Keys.Ed25519.parseKeyPair(publicKeyBytes, secretKeyBytes);
        break;
      case '02':
        publicKeyBytes = Keys.Secp256K1.privateToPublicKey(secretKeyBytes);
        keyPair = Keys.Secp256K1.parseKeyPair(
          publicKeyBytes,
          secretKeyBytes,
          'raw' // TODO: how to know whether this is 'raw' or 'der'?
        );
        break;
      default:
        throw new Error('Secret key did not have compatible algorithm prefix.');
    }

    this.appState.userAccounts.push({
      alias: name,
      KeyPair: keyPair
    });
    this.appState.selectedUserAccount = this.appState.userAccounts[
      this.appState.userAccounts.length - 1
    ];
    this.persistVault();
  }

  @action
  async removeUserAccount(name: string) {
    if (!this.appState.isUnlocked) {
      throw new Error('Unlock it before adding new account');
    }

    let account = this.appState.userAccounts.find(account => {
      return account.alias === name;
    });

    if (!account) {
      throw new Error(`The account does't exists`);
    }

    this.appState.userAccounts.remove(account);

    if (this.appState.selectedUserAccount?.alias === account.alias) {
      this.appState.selectedUserAccount =
        this.appState.userAccounts.length > 0
          ? this.appState.userAccounts[0]
          : null;
    }
    this.persistVault();
  }

  /**
   * Reorder account
   * In UI page, a user could drag the account whose index is startIndex, and drop to
   * a new position endIndex.
   *
   * For example, if we have a list, [a,b,c,d,e], now startIndex is 2, endIndex is 4.
   * After this operation, the result is [a,b,d,e,c]
   *
   * @param startIndex
   * @param endIndex
   */
  @action
  async reorderAccount(startIndex: number, endIndex: number) {
    if (!this.appState.isUnlocked) {
      throw new Error('Unlock it before reorder account');
    }

    const len = this.appState.userAccounts.length;
    if (
      startIndex < 0 ||
      endIndex < 0 ||
      startIndex >= len ||
      endIndex >= len
    ) {
      throw new Error('Invalid index number');
    }
    if (startIndex == endIndex) {
      return;
    }

    const removed = this.appState.userAccounts.spliceWithArray(startIndex, 1);
    this.appState.userAccounts.spliceWithArray(endIndex, 0, removed);

    this.persistVault();
  }

  @action
  async renameUserAccount(oldName: string, newName: string) {
    if (!this.appState.isUnlocked) {
      throw new Error('Unlock it before rename account');
    }

    if (!newName) {
      throw new Error('Invalid new name');
    }

    const account = this.appState.userAccounts.find(
      account => account.alias === oldName
    );
    if (!account) {
      throw new Error('Invalid old name');
    }

    const accountWithNewName = this.appState.userAccounts.find(
      account => account.alias === newName
    );

    if (accountWithNewName) {
      throw new Error('There is another account with the same name');
    }

    account.alias = newName;

    this.persistVault();
  }

  /**
   * Serialize and Deserialize is needed for ByteArray(or Uint8Array),
   * since JSON.parse(JSON.stringify(ByteArray)) !== ByteArray
   * @param KeyPairWithAlias
   */
  private serializeKeyPairWithAlias(
    KeyPairWithAlias: KeyPairWithAlias
  ): SerializedSignKeyPairWithAlias {
    const algorithm = KeyPairWithAlias.KeyPair.signatureAlgorithm;
    let prefix;
    switch (algorithm) {
      case 'ed25519':
        prefix = '01';
        break;
      case 'secp256k1':
        prefix = '02';
        break;
      default:
        throw new Error('Public key did not have compatible algorithm prefix');
    }

    return {
      name: KeyPairWithAlias.alias,
      signKeyPair: {
        publicKey:
          prefix + encodeBase16(KeyPairWithAlias.KeyPair.publicKey.toBytes()),
        secretKey: encodeBase16(KeyPairWithAlias.KeyPair.privateKey)
      }
    };
  }

  private deserializeKeyPairWithAlias(
    serializedKeyPairWithAlias: SerializedSignKeyPairWithAlias
  ): KeyPairWithAlias {
    let encodedPublicKey;
    switch (serializedKeyPairWithAlias.signKeyPair.publicKey.substring(0, 2)) {
      case '01':
        encodedPublicKey = Keys.Ed25519.parsePublicKey(
          decodeBase16(serializedKeyPairWithAlias.signKeyPair.publicKey)
        );

        break;

      default:
        break;
    }
    return {
      alias: serializedKeyPairWithAlias.name,
      KeyPair: {
        publicKey: decodeBase16(
          serializedKeyPairWithAlias.signKeyPair.publicKey
        ),
        secretKey: decodeBase16(
          serializedKeyPairWithAlias.signKeyPair.secretKey
        )
      }
    };
  }

  /**
   * Encrypt user accounts using salted password hash.
   * Save the encryptedVault string to the store.
   * Save the plain text passwordSalt to the store.
   */
  private async persistVault() {
    const encryptedVault = await passworder.encrypt(this.passwordHash!, {
      userAccounts: this.appState.userAccounts.map(
        this.serializeKeyPairWithAlias
      ),
      selectedUserAccount: this.appState.selectedUserAccount
        ? this.serializeKeyPairWithAlias(this.appState.selectedUserAccount)
        : null
    });

    this.saveKeyValuetoStore(this.encryptedVaultKey, encryptedVault);
    this.saveKeyValuetoStore(this.saltKey, this.passwordSalt!);
  }

  /**
   * Saves a given value under a given key in the store.
   * @param key Key to save value under in store.
   * @param value Value to save under Key in store.
   */
  private saveKeyValuetoStore(key: string, value: any) {
    store.set(key, value);
  }

  /**
   * Get a stored value by key. If no key exists then return null.
   * @param key Key under which value is stored.
   * @returns Stored value by given key.
   */
  private getStoredValueWithKey(key: string) {
    return store.get(key, null);
  }

  private async restoreVault(
    password: string
  ): Promise<[PersistentVaultData, string]> {
    let encryptedVault = this.getStoredValueWithKey(this.encryptedVaultKey);
    if (!encryptedVault) {
      throw new Error('There is no vault');
    }
    let storedSalt = this.getStoredValueWithKey(this.saltKey);
    let [, saltedPassword] = this.saltPassword(password, storedSalt);
    let saltedPasswordHash = this.hash(saltedPassword);

    const vault = await passworder.decrypt(saltedPasswordHash, encryptedVault);
    return [vault as PersistentVaultData, saltedPasswordHash];
  }

  /**
   * Helper function to convert a string into a Uint8array
   * @param {string} str to get bytes of
   */
  private stringToBytes(str: string) {
    return new TextEncoder().encode(str);
  }

  /**
   * Generate a salted password for hashing.
   * @param {string} password for salting.
   * @param  {Uint8Array} [salt=null] will use instead of random bytes if provided.
   * @returns {Uint8Array} Salt bytes.
   * @returns {Uint8Array} Salted password bytes.
   */
  private saltPassword(
    password: string,
    salt: Uint8Array | null = null
  ): [Uint8Array, Uint8Array] {
    let passwordSalt: Uint8Array;
    salt !== null
      ? (passwordSalt = Uint8Array.from(Object.values(salt)))
      : (passwordSalt = nacl.randomBytes(64));
    let passwordBytes = this.stringToBytes(password);
    let saltedPasswordBytes = new Uint8Array(
      passwordSalt.length + passwordBytes.length
    );
    saltedPasswordBytes.set(passwordSalt);
    saltedPasswordBytes.set(passwordBytes, passwordSalt.length);
    return [passwordSalt, saltedPasswordBytes];
  }

  /**
   * Hash given bytes and encodes in base16
   * @param {Uint8Array} bytes Bytes for hashing.
   * @returns {String} hex encoded hash.
   */
  private hash(bytes: Uint8Array) {
    let hashedBytes = nacl.hash(bytes);
    return encodeBase16(hashedBytes);
  }

  /*
   * user can lock the plugin manually, and then user need to use
   * password to unlock, so that the plugin won't be used by others
   */
  @action.bound
  async lock() {
    this.passwordHash = null;
    this.appState.isUnlocked = false;
    await this.clearAccount();
  }

  /**
   * Using the password to unlock
   * @param {string} password
   */
  @action.bound
  async unlock(password: string) {
    let vaultResponse = await this.restoreVault(password);
    let vault = vaultResponse[0];
    this.passwordHash = vaultResponse[1];
    this.appState.isUnlocked = true;
    this.appState.userAccounts.replace(
      vault.userAccounts.map(this.deserializeKeyPairWithAlias)
    );
    this.appState.selectedUserAccount = vault.selectedUserAccount
      ? this.deserializeKeyPairWithAlias(vault.selectedUserAccount)
      : null;
  }

  @computed
  get isUnlocked(): boolean {
    return this.appState.isUnlocked;
  }

  @action.bound
  async clearAccount() {
    this.appState.userAccounts.clear();
  }
}

export default AuthController;
