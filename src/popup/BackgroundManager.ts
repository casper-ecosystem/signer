import { browser } from 'webextension-polyfill-ts';
import { Rpc } from '../lib/rpc/rpc';
import { AppState } from '../lib/MemStore';
import { action } from 'mobx';
import ErrorContainer from './container/ErrorContainer';
import { SerializedSignKeyPairWithAlias } from '../background/AuthController';

export class BackgroundManager {
  private rpc: Rpc;

  constructor(private appState: AppState, private errors: ErrorContainer) {
    // RPC is duplex
    this.rpc = new Rpc({
      addListener: browser.runtime.onMessage.addListener,
      destination: 'background',
      logMessages: false,
      postMessage: browser.runtime.sendMessage,
      source: 'popup'
    });

    this.rpc.register('popup.updateState', this.onStateUpdate.bind(this));
    this.rpc.call<AppState>('background.getState').then(appState => {
      this.onStateUpdate(appState);
    });
  }

  @action.bound
  private onStateUpdate(appState: AppState) {
    this.appState.isUnlocked = appState.isUnlocked;
    this.appState.connectionStatus = appState.connectionStatus;
    this.appState.connectionRequested = appState.connectionRequested;
    this.appState.hasCreatedVault = appState.hasCreatedVault;
    this.appState.selectedUserAccount = appState.selectedUserAccount;
    this.appState.userAccounts.replace(appState.userAccounts);
    this.appState.toSignMessages.replace(appState.toSignMessages);
  }

  public unlock(password: string) {
    return this.errors.withCapture(
      this.rpc.call<void>('account.unlock', password)
    );
  }

  public createNewVault(password: string) {
    return this.rpc.call<void>('account.createNewVault', password);
  }

  public lock() {
    return this.rpc.call<void>('account.lock');
  }

  public importUserAccount(name: string, privateKey: string) {
    return this.errors.withCapture(
      this.rpc.call<void>('account.importUserAccount', name, privateKey)
    );
  }

  public reorderAccount(index1: number, index2: number) {
    return this.errors.withCapture(
      this.rpc.call<void>('account.reorderAccount', index1, index2)
    );
  }

  public removeUserAccount(name: string) {
    return this.errors.withCapture(
      this.rpc.call<void>('account.removeUserAccount', name)
    );
  }

  public signMessage(msgId: number) {
    return this.errors.withCapture(
      this.rpc.call<void>('sign.signMessage', msgId)
    );
  }

  public rejectSignMessage(msgId: number) {
    return this.errors.withCapture(
      this.rpc.call<void>('sign.rejectMessage', msgId)
    );
  }

  public switchToAccount(accountName: string) {
    return this.errors.withCapture(
      this.rpc.call<void>('account.switchToAccount', accountName)
    );
  }

  public getSelectUserAccount() {
    return this.errors.withCapture(
      this.rpc.call<SerializedSignKeyPairWithAlias>(
        'account.getSelectUserAccount'
      )
    );
  }

  public resetVault() {
    return this.errors.withCapture(this.rpc.call<void>('account.resetVault'));
  }

  public renameUserAccount(oldName: string, newName: string) {
    return this.errors.withCapture(
      this.rpc.call<void>('account.renameUserAccount', oldName, newName)
    );
  }

  public connectToSite() {
    return this.errors.withCapture(
      this.rpc.call<void>('connection.connectToSite')
    );
  }

  public disconnectFromSite() {
    return this.errors.withCapture(
      this.rpc.call<void>('connection.disconnectFromSite')
    );
  }

  public resetConnectionRequest() {
    return this.errors.withCapture(
      this.rpc.call<void>('connection.resetConnectionRequest')
    );
  }
}
