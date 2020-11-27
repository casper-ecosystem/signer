import { browser } from 'webextension-polyfill-ts';
import { AppState } from '../lib/MemStore';

export default class ConnectionManager {
  constructor(private appState: AppState) {}

  public isConnected() {
    return this.appState.connectionStatus;
  }

  public hasCreatedVault() {
    return this.appState.hasCreatedVault;
  }

  public requestConnection() {
    if (!this.isConnected()) {
      this.appState.connectionRequested = true;
      browser.notifications.create({
        title: 'Connection Request',
        iconUrl: browser.extension.getURL('logo64.png'),
        message: 'Open Signer to Approve or Reject Connection',
        type: 'basic'
      });
    }
  }

  public resetConnectionRequest() {
    this.appState.connectionRequested = false;
  }

  public connectToSite() {
    this.appState.connectionStatus = true;
  }

  public disconnectFromSite() {
    this.appState.connectionStatus = false;
  }
}
