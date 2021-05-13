import { browser } from 'webextension-polyfill-ts';
import { Rpc } from '../lib/rpc/rpc';
import { AppState } from '../lib/MemStore';
import { action } from 'mobx';
import ErrorContainer from './container/ErrorContainer';
import { KeyPairWithAlias } from '../@types/models';
import { DeployData } from '../background/SignMessageManager';

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
    this.appState.unsignedDeploys.replace(appState.unsignedDeploys);
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

  public importUserAccount(name: string, secretKey: string) {
    return this.errors.withCapture(
      this.rpc.call<void>('account.importUserAccount', name, secretKey)
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

  public signDeploy(deployId: number) {
    return this.errors.withCapture(
      this.rpc.call<void>('sign.signDeploy', deployId)
    );
  }

  public rejectSignDeploy(msgId: number) {
    return this.errors.withCapture(
      this.rpc.call<void>('sign.rejectSignDeploy', msgId)
    );
  }

  public parseDeployData(deployId: number) {
    return this.errors.withCapture(
      this.rpc.call<DeployData>('sign.parseDeployData', deployId)
    );
  }

  public switchToAccount(accountName: string) {
    return this.errors.withCapture(
      this.rpc.call<void>('account.switchToAccount', accountName)
    );
  }

  public getSelectUserAccount() {
    return this.errors.withCapture(
      this.rpc.call<KeyPairWithAlias>('account.getSelectUserAccount')
    );
  }

  public getActivePublicKeyHex() {
    return this.errors.withCapture(
      this.rpc.call<string>('account.getActivePublicKeyHex')
    );
  }

  public getActiveAccountHash() {
    return this.errors.withCapture(
      this.rpc.call<string>('account.getActiveAccountHash')
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

  public downloadAccountKeys(account: KeyPairWithAlias) {
    return this.errors.withCapture(
      this.rpc.call<void>('account.downloadAccountKeys', account)
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
