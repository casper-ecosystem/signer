import { AppState } from '../lib/MemStore';
import PopupManager from '../background/PopupManager';

export default class ConnectionManager {
  private popupManager: PopupManager;

  constructor(private appState: AppState) {
    this.popupManager = new PopupManager();
  }

  public isConnected() {
    return this.appState.connectionStatus;
  }

  public requestConnection() {
    this.appState.connectionRequested = true;
    this.popupManager.openPopup('connect');
  }

  public resetConnectionRequest() {
    this.appState.connectionRequested = false;
    this.popupManager.closePopup();
  }

  public connectToSite() {
    this.appState.connectionStatus = true;
    this.popupManager.closePopup();
  }

  public disconnectFromSite() {
    this.appState.connectionStatus = false;
  }
}
