import { action, computed, IObservableArray } from 'mobx';
import { BackgroundManager } from '../BackgroundManager';
import ErrorContainer from './ErrorContainer';
import { AppState } from '../../lib/MemStore';
import { saveAs } from 'file-saver';

export function saveToFile(content: string, filename: string) {
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

  async removeUserAccount(publicKeyBase64: string) {
    return this.backgroundManager.removeUserAccount(publicKeyBase64);
  }

  async swapTwoAccount(index1: number, index2: number) {
    return this.backgroundManager.swapTwoAccount(index1, index2);
  }

  switchToAccount(accountName: string) {
    return this.backgroundManager.switchToAccount(accountName);
  }

  @computed
  get userAccounts(): IObservableArray<SignKeyPairWithAlias> {
    return this.appState.userAccounts;
  }

  async downloadActiveKey() {
    let userAccount = await this.backgroundManager.getSelectUserAccount();
    // Save the private and public keys to disk.
    saveToFile(
      userAccount.signKeyPair.secretKey,
      `${userAccount.name}.private.key`
    );
    saveToFile(
      userAccount.signKeyPair.publicKey,
      `${userAccount.name}.public.key`
    );
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
}

export default AccountManager;
