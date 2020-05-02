import { action, computed, IObservableArray } from 'mobx';
import { BackgroundManager } from '../BackgroundManager';
import ErrorContainer from '../../../../ui/src/containers/ErrorContainer';
import { AppState } from '../../lib/MemStore';

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

  switchToAccount(accountName: string) {
    return this.backgroundManager.switchToAccount(accountName);
  }

  @computed
  get userAccounts(): IObservableArray<SignKeyPairWithAlias> {
    return this.appState.userAccounts;
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

  @computed
  get isUnLocked(): boolean {
    return this.appState.isUnlocked;
  }

  @action
  async clearAccount() {
    // this.userAccount = [];
    return;
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
