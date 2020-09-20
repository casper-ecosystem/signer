import { action, computed, IObservableArray } from 'mobx';
import { BackgroundManager } from '../BackgroundManager';
import ErrorContainer from './ErrorContainer';
import { AppState } from '../../lib/MemStore';
import { saveAs } from 'file-saver';
import { encodeBase16, Keys } from 'casperlabs-sdk';
import { decodeBase64 } from 'tweetnacl-ts';

function saveToFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, filename);
}

class AccountManager {
  constructor(
    private errors: ErrorContainer,
    private backgroundManager: BackgroundManager,
    private appState: AppState
  ) {}

  async createNewVault(password: string) {
    await this.errors.withCapture(
      this.backgroundManager.createNewVault(password)
    );
  }

  async importUserAccount(name: string, privateKey: string) {
    return this.backgroundManager.importUserAccount(name, privateKey);
  }

  async removeUserAccount(name: string) {
    return this.backgroundManager.removeUserAccount(name);
  }

  async reorderAccount(startIndex: number, endIndex: number) {
    // the data flow is always from background to frontend.
    // we need do reorder operations on both background and frontend side,
    // so that UI won't get jitter
    const len = this.appState.userAccounts.length;

    if (
      startIndex < 0 ||
      endIndex < 0 ||
      startIndex >= len ||
      endIndex >= len
    ) {
      throw new Error('Invalid index number');
    }
    if (startIndex === endIndex) {
      return;
    }

    const removed = this.appState.userAccounts.spliceWithArray(startIndex, 1);
    this.appState.userAccounts.spliceWithArray(endIndex, 0, removed);
    return this.backgroundManager.reorderAccount(startIndex, endIndex);
  }

  switchToAccount(accountName: string) {
    return this.backgroundManager.switchToAccount(accountName);
  }

  @computed
  get userAccounts(): IObservableArray<SignKeyPairWithAlias> {
    return this.appState.userAccounts;
  }

  static downloadPemFiles(
    publicKey: ByteArray,
    privateKey: ByteArray,
    accountName: string
  ) {
    // Save the private and public keys to disk.
    saveToFile(
      Keys.Ed25519.privateKeyEncodeInPem(privateKey),
      `${accountName}_secret_key.pem`
    );
    saveToFile(
      Keys.Ed25519.publicKeyEncodeInPem(publicKey),
      `${accountName}_public_key.pem`
    );
    const publicKeyBase16 = encodeBase16(publicKey);
    saveToFile('01' + publicKeyBase16, `${accountName}_public_key_hex`);
  }

  async downloadActiveKey() {
    let userAccount = await this.backgroundManager.getSelectUserAccount();
    // Save the private and public keys to disk.
    AccountManager.downloadPemFiles(
      decodeBase64(userAccount.signKeyPair.publicKey),
      decodeBase64(userAccount.signKeyPair.secretKey),
      userAccount.name
    );
  }

  async getSelectedAccountKey(acctName: string) {
    await this.backgroundManager.switchToAccount(acctName);
    let account = await this.backgroundManager.getSelectUserAccount();
    let key = account.signKeyPair.publicKey;
    return key;
  }

  async getPublicKeyHex(acctName: string) {
    let pubKey64 = await this.getSelectedAccountKey(acctName);
    let pubKeyHex = encodeBase16(decodeBase64(pubKey64));
    return pubKeyHex;
  }

  async lock() {
    return this.backgroundManager.lock();
  }

  async unlock(password: string) {
    return this.backgroundManager.unlock(password);
  }

  @computed
  get hasCreatedVault(): boolean {
    return this.appState.hasCreatedVault;
  }

  @action
  async resetVault() {
    return this.backgroundManager.resetVault();
  }

  @computed
  get isUnLocked(): boolean {
    return this.appState.isUnlocked;
  }

  @computed
  get selectedUserAccount() {
    return this.appState.selectedUserAccount;
  }

  @computed
  get toSignMessages() {
    return this.appState.toSignMessages;
  }

  async renameUserAccount(oldName: string, newName: string) {
    return this.backgroundManager.renameUserAccount(oldName, newName);
  }
}

export default AccountManager;
