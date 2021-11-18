import { browser } from 'webextension-polyfill-ts';
import { Rpc } from '../lib/rpc/rpc';
import { AppState } from '../lib/MemStore';
import { action } from 'mobx';
import ErrorContainer from './container/ErrorContainer';
import { KeyPairWithAlias } from '../@types/models';
import { DeployData } from '../background/SigningManager';
import { openPurpose } from '../background/PopupManager';

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
    this.appState.isIntegratedSite = appState.isIntegratedSite;
    this.appState.isUnlocked = appState.isUnlocked;
    this.appState.unlockAttempts = appState.unlockAttempts;
    this.appState.lockoutTimerStarted = appState.lockoutTimerStarted;
    this.appState.remainingMins = appState.remainingMins;
    this.appState.currentTab = appState.currentTab;
    this.appState.connectionRequested = appState.connectionRequested;
    this.appState.connectedSites = appState.connectedSites;
    this.appState.hasCreatedVault = appState.hasCreatedVault;
    this.appState.activeUserAccount = appState.activeUserAccount;
    this.appState.userAccounts.replace(appState.userAccounts);
    this.appState.unsignedDeploys.replace(appState.unsignedDeploys);
    this.appState.unsignedMessages.replace(appState.unsignedMessages);
    this.appState.idleTimeoutMins = appState.idleTimeoutMins;
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

  public importUserAccount(
    name: string,
    secretKeyBase64: string,
    algorithm: string,
    backedUp: boolean
  ) {
    return this.errors.withCapture(
      this.rpc.call<void>(
        'account.importUserAccount',
        name,
        secretKeyBase64,
        algorithm,
        backedUp
      )
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

  public isBackedUp(alias: string) {
    return this.errors.withCapture(
      this.rpc.call<boolean>('account.isBackedUp', alias)
    );
  }

  public signDeploy(deployId: number) {
    return this.errors.withCapture(
      this.rpc.call<void>('sign.signDeploy', deployId)
    );
  }

  public rejectSignDeploy(deployId: number) {
    return this.errors.withCapture(
      this.rpc.call<void>('sign.rejectSignDeploy', deployId)
    );
  }

  public parseDeployData(deployId: number) {
    return this.errors.withCapture(
      this.rpc.call<DeployData>('sign.parseDeployData', deployId)
    );
  }

  public approveSigningMessage(messageId: number) {
    return this.errors.withCapture(
      this.rpc.call<void>('sign.approveSigningMessage', messageId)
    );
  }

  public cancelSigningMessage(messageId: number) {
    return this.errors.withCapture(
      this.rpc.call<void>('sign.cancelSigningMessage', messageId)
    );
  }

  public switchToAccount(accountName: string) {
    return this.errors.withCapture(
      this.rpc.call<void>('account.switchToAccount', accountName)
    );
  }

  public getActiveUserAccount() {
    return this.errors.withCapture(
      this.rpc.call<KeyPairWithAlias>('account.getActiveUserAccount')
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

  public getPublicKeyHexByAlias(alias: string) {
    return this.errors.withCapture(
      this.rpc.call<string>('account.getPublicKeyHexByAlias', alias)
    );
  }

  public getAccountHashByAlias(alias: string) {
    return this.errors.withCapture(
      this.rpc.call<string>('account.getAccountHashByAlias', alias)
    );
  }

  public resetVault() {
    return this.errors.withCapture(this.rpc.call<void>('account.resetVault'));
  }

  public resetLockout() {
    return this.errors.withCapture(this.rpc.call<void>('account.resetLockout'));
  }

  public startLockoutTimer(timeInMinutes: number) {
    return this.errors.withCapture(
      this.rpc.call<void>('account.startLockoutTimer', timeInMinutes)
    );
  }

  public resetLockoutTimer() {
    return this.errors.withCapture(
      this.rpc.call<void>('account.resetLockoutTimer')
    );
  }

  public renameUserAccount(oldName: string, newName: string) {
    return this.errors.withCapture(
      this.rpc.call<void>('account.renameUserAccount', oldName, newName)
    );
  }

  public downloadAccountKeys(accountAlias: string) {
    return this.errors.withCapture(
      this.rpc.call<void>('account.downloadAccountKeys', accountAlias)
    );
  }
  public connectToSite(url?: string) {
    return this.errors.withCapture(
      this.rpc.call<void>('connection.connectToSite', url)
    );
  }

  public disconnectFromSite(site?: string) {
    return this.errors.withCapture(
      this.rpc.call<void>('connection.disconnectFromSite', site)
    );
  }

  public removeSite(url: string) {
    return this.errors.withCapture(
      this.rpc.call<void>('connection.removeSite', url)
    );
  }

  public resetConnectionRequest() {
    return this.errors.withCapture(
      this.rpc.call<void>('connection.resetConnectionRequest')
    );
  }

  public confirmPassword(password: string) {
    return this.errors.withCapture(
      this.rpc.call<boolean>('account.confirmPassword', password)
    );
  }

  public isIntegratedSite(hostname: string) {
    return this.errors.withCapture(
      this.rpc.call<boolean>('connection.isIntegratedSite', hostname)
    );
  }

  public configureTimeout(durationMins: number) {
    return this.errors.withCapture(
      this.rpc.call<void>('account.configureTimeout', durationMins)
    );
  }

  public callOpenPopup(reasonToOpen: openPurpose) {
    return this.errors.withCapture(
      this.rpc.call<void>('popup.openPopup', reasonToOpen)
    );
  }

  public callClosePopup() {
    return this.errors.withCapture(this.rpc.call<void>('popup.closePopup'));
  }
}
