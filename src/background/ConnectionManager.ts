import { browser } from 'webextension-polyfill-ts';
import { AppState } from '../lib/MemStore';

export default class ConnectionManager {
  constructor(private appState: AppState) {}

  public isConnected() {
    return this.appState.connectionStatus;
  }

  public requestConnection() {
    this.appState.connectionRequested = true;
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
