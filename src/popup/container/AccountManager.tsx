// import React from 'react';
import { action, computed, IObservableArray } from 'mobx';
import { BackgroundManager } from '../BackgroundManager';
import ErrorContainer from './ErrorContainer';
import { AppState } from '../../lib/MemStore';
import { KeyPairWithAlias } from '../../@types/models';
import { FieldState, FormState } from 'formstate';
import { valueRequired } from '../../lib/FormValidator';
// import { confirm } from '../components/Confirmation';
import AccountController from '../../background/AuthController';

class AccountManager {
  constructor(
    private errors: ErrorContainer,
    private backgroundManager: BackgroundManager,
    private appState: AppState,
    private accountController: AccountController
  ) {}

  async createNewVault(password: string) {
    await this.errors.withCapture(
      this.accountController.createNewVault(password)
    );
  }

  async importUserAccount(
    name: string,
    secretKeyBase64: string,
    algorithm: string,
    backedUp: boolean
  ) {
    return this.backgroundManager.importUserAccount(
      name,
      secretKeyBase64,
      algorithm,
      backedUp
    );
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
  get userAccounts(): IObservableArray<KeyPairWithAlias> {
    return this.appState.userAccounts;
  }

  @computed
  get isTimeToSecurityCheckup(): boolean {
    return this.appState.isTimeToSecurityCheckup;
  }

  @action
  async resetSecurityCheckup() {
    return await this.backgroundManager.resetSecurityCheckup();
  }

  async isBackedUp(alias: string) {
    return await this.backgroundManager.isBackedUp(alias);
  }

  async downloadPemFiles(alias: string) {
    // Save the secret and public keys to disk.
    await this.accountController.downloadAccountKeys(alias);
  }

  async downloadAllAccountKeys() {
    await this.accountController.downloadAllAccountKeys();
  }

  async downloadActiveKey() {
    let userAccount = await this.backgroundManager.getActiveUserAccount();
    // Save the secret and public keys to disk.
    this.downloadPemFiles(userAccount.alias);
  }

  async getActivePublicKeyHex() {
    return await this.backgroundManager.getActivePublicKeyHex();
  }

  async getActiveAccountHash() {
    return await this.backgroundManager.getActiveAccountHash();
  }

  async getPublicKeyHexByAlias(alias: string) {
    return await this.backgroundManager.getPublicKeyHexByAlias(alias);
  }

  async getAccountHashByAlias(alias: string) {
    return await this.backgroundManager.getAccountHashByAlias(alias);
  }

  async lock() {
    return this.accountController.lock();
  }

  async unlock(password: string) {
    // when unlocking account show deprecation message
    await this.showcasperWalletAnnouncement();
    return this.accountController.unlock(password);
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
  get activeUserAccount() {
    return this.appState.activeUserAccount;
  }

  @computed
  get remainingUnlockAttempts() {
    return this.appState.unlockAttempts;
  }

  @computed
  get isLockedOut() {
    return this.appState.lockedOut;
  }

  @action
  async resetLockout() {
    return this.backgroundManager.resetLockout();
  }

  @action
  async startLockoutTimer(timeInMinutes: number) {
    return this.accountController.startLockoutTimer(timeInMinutes);
  }

  @computed
  get lockoutTimerStarted() {
    return this.appState.lockoutTimerStarted;
  }

  @computed
  get timerDuration() {
    return this.appState.timerDurationMins;
  }

  @computed
  get remainingMins() {
    return this.appState.remainingMins;
  }

  @action
  async resetLockoutTimer() {
    return this.backgroundManager.resetLockoutTimer();
  }

  async renameUserAccount(oldName: string, newName: string) {
    return this.backgroundManager.renameUserAccount(oldName, newName);
  }

  async confirmPassword(password: string) {
    return this.backgroundManager.confirmPassword(password);
  }

  confirmPasswordForm = new FormState({
    confirmPasswordField: new FieldState<string>('').validators(valueRequired)
  });

  @computed
  get confirmPasswordDisabled(): boolean {
    let disabled =
      !this.confirmPasswordForm.$.confirmPasswordField.$ ||
      !this.confirmPasswordForm.$.confirmPasswordField.hasBeenValidated ||
      (this.confirmPasswordForm.$.confirmPasswordField.hasBeenValidated &&
        this.confirmPasswordForm.$.confirmPasswordField.hasError);
    return disabled;
  }

  @computed
  get idleTimeoutMins(): number {
    return this.appState.idleTimeoutMins;
  }

  async configureTimeout(durationMins: number) {
    if (durationMins === this.idleTimeoutMins) return;
    await this.backgroundManager.configureTimeout(durationMins);
  }

  showcasperWalletAnnouncement() {
    // return confirm(
    //   <div className="text-danger">Move to Casper Wallet</div>,
    //   'Signer will be going away soon and it’s time to move. Make the switch to Casper Wallet in minutes.',
    //   'Get Started',
    //   'Cancel'
    // ).then(
    //   // OK
    //   async () => {
    //     window.open(
    //       'https://www.casperwallet.io/user-guide/signer-user-start-here',
    //       '_newtab'
    //     );
    //   },
    //   // CANCEL
    //   async () => {
    //     // close popup
    //   }
    // );
  }
}

export default AccountManager;
