import { action, computed } from 'mobx';
import passworder from 'browser-passworder';
import store from 'store';
import * as nacl from 'tweetnacl';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';
import { AppState } from '../lib/MemStore';

export interface SerializedSignKeyPairWithAlias {
  name: string;
  signKeyPair: {
    publicKey: string; // base64 encoded
    secretKey: string; // base64 encoded
  };
}

interface PersistentVaultData {
  userAccounts: SerializedSignKeyPairWithAlias[];
  selectedUserAccount: SerializedSignKeyPairWithAlias | null;
}

class AuthController {
  // we store hashed password instead of original password
  private passwordHash: string | null = null;

  // we will use the passwordHash above to encrypt the valut object
  // and then using this key to store it in local storage
  private encryptedVaultKey = 'encryptedVault';

  constructor(private appState: AppState) {
    if (this.getEncryptedVault()) {
      this.appState.hasCreatedVault = true;
    }
  }

  @action.bound
  async createNewVault(password: string): Promise<void> {
    if (this.getEncryptedVault()) {
      throw new Error('There is a vault already');
    }
    const hash = this.hash(password);
    this.passwordHash = hash;
    await this.clearAccount();
    await this.persistVault();
    this.appState.hasCreatedVault = true;
    this.appState.isUnlocked = true;
  }

  @action
  switchToAccount(accountName: string) {
    let i = this.appState.userAccounts.findIndex(a => a.name === accountName);
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
    return this.serializeSignKeyPairWithAlias(
      this.appState.selectedUserAccount
    );
  }

  @action
  async resetVault() {
    await this.clearAccount();
    this.appState.selectedUserAccount = null;
    this.appState.toSignMessages.clear();
    this.appState.hasCreatedVault = false;
    store.remove(this.encryptedVaultKey);
  }

  @action
  async importUserAccount(name: string, privateKeyBase64: string) {
    if (!this.appState.isUnlocked) {
      throw new Error('Unlock it before adding new account');
    }

    let account = this.appState.userAccounts.find(account => {
      return (
        account.name === name ||
        encodeBase64(account.signKeyPair.secretKey) === privateKeyBase64
      );
    });

    if (account) {
      throw new Error(
        `A account with same ${
          account.name === name ? 'name' : 'private key'
        } already exists`
      );
    }

    const keyPair = nacl.sign.keyPair.fromSecretKey(
      decodeBase64(privateKeyBase64)
    );

    this.appState.userAccounts.push({
      name: name,
      signKeyPair: keyPair
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
      return account.name === name;
    });

    if (!account) {
      throw new Error(`The account does't exists`);
    }

    this.appState.userAccounts.remove(account);

    if (this.appState.selectedUserAccount?.name === account.name) {
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
      account => account.name === oldName
    );
    if (!account) {
      throw new Error('Invalid old name');
    }

    const accountWithNewName = this.appState.userAccounts.find(
      account => account.name === newName
    );

    if (accountWithNewName) {
      throw new Error('There is another account with the same name');
    }

    account.name = newName;

    this.persistVault();
  }

  /**
   * Serialize and Deserialize is needed for ByteArray(or Uint8Array),
   * since JSON.parse(JSON.stringify(ByteArray)) !== ByteArray
   * @param signKeyPairWithAlias
   */
  private serializeSignKeyPairWithAlias(
    signKeyPairWithAlias: SignKeyPairWithAlias
  ): SerializedSignKeyPairWithAlias {
    return {
      name: signKeyPairWithAlias.name,
      signKeyPair: {
        publicKey: encodeBase64(signKeyPairWithAlias.signKeyPair.publicKey),
        secretKey: encodeBase64(signKeyPairWithAlias.signKeyPair.secretKey)
      }
    };
  }

  private deserializeSignKeyPairWithAlias(
    serializedKeyPairWithAlias: SerializedSignKeyPairWithAlias
  ): SignKeyPairWithAlias {
    return {
      name: serializedKeyPairWithAlias.name,
      signKeyPair: {
        publicKey: decodeBase64(
          serializedKeyPairWithAlias.signKeyPair.publicKey
        ),
        secretKey: decodeBase64(
          serializedKeyPairWithAlias.signKeyPair.secretKey
        )
      }
    };
  }

  /**
   * encrypted userAccounts by using passwordHash, and save it to local storage.
   */
  private async persistVault() {
    const encryptedVault = await passworder.encrypt(this.passwordHash!, {
      userAccounts: this.appState.userAccounts.map(
        this.serializeSignKeyPairWithAlias
      ),
      selectedUserAccount: this.appState.selectedUserAccount
        ? this.serializeSignKeyPairWithAlias(this.appState.selectedUserAccount)
        : null
    });
    this.saveEncryptedVault(encryptedVault);
  }

  private getEncryptedVault() {
    return store.get(this.encryptedVaultKey);
  }

  private saveEncryptedVault(encryptedVault: string) {
    store.set(this.encryptedVaultKey, encryptedVault);
  }

  private async restoreVault(password: string): Promise<PersistentVaultData> {
    let encryptedVault = this.getEncryptedVault();
    if (!encryptedVault) {
      throw new Error('There is no vault');
    }
    const vault = await passworder.decrypt(password, encryptedVault);
    return vault as PersistentVaultData;
  }

  /**
   * Hash the user input password for storing locally
   * @param str
   */
  private hash(str: string) {
    const b = Buffer.from(str);
    const h = nacl.hash(Uint8Array.from(b));
    return encodeBase64(h);
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
    const passwordHash = this.hash(password);
    const vault = await this.restoreVault(passwordHash);
    this.passwordHash = passwordHash;
    this.appState.isUnlocked = true;
    this.appState.userAccounts.replace(
      vault.userAccounts.map(this.deserializeSignKeyPairWithAlias)
    );
    this.appState.selectedUserAccount = vault.selectedUserAccount
      ? this.deserializeSignKeyPairWithAlias(vault.selectedUserAccount)
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
