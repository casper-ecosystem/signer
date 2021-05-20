import { AppState } from '../lib/MemStore';
import { toJS } from 'mobx';
import PopupManager from '../background/PopupManager';

export default class ConnectionManager {
  private popupManager: PopupManager;
  public activeTab: number | null;

  constructor(private appState: AppState) {
    this.popupManager = new PopupManager();
    this.activeTab = null;
    this.appState = appState;

    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (
        this.activeTab &&
        tabId === this.activeTab &&
        changeInfo.status === 'complete'
      ) {
        await this.checkConnected();
      }
    });

    chrome.tabs.onActivated.addListener(async activeInfo => {
      this.activeTab = activeInfo.tabId;
      await this.checkConnected();
    });
  }

  private async checkConnected() {
    const url = await this.getActiveTab();
    if (url) {
      const isConnected = this.appState.connectedSites.includes(url);
      this.appState.connectionStatus = isConnected;
    }
  }

  public isConnected() {
    return this.appState.connectionStatus;
  }

  public requestConnection() {
    if (this.appState.userAccounts.length === 0) {
      this.popupManager.openPopup('noAccount');
      return;
    }
    this.appState.connectionRequested = true;
    this.popupManager.openPopup('connect');
  }

  public resetConnectionRequest() {
    this.appState.connectionRequested = false;
    this.popupManager.closePopup();
  }

  public async connectToSite() {
    const url = await this.getActiveTab();
    if (url) {
      this.appState.connectedSites.push(url);
      console.log(toJS(this.appState));
      this.appState.connectionStatus = true;
      this.popupManager.closePopup();
    }
  }

  public async disconnectFromSite(site?: string) {
    if (site) {
      this.appState.connectedSites.remove(site);
      return;
    }

    const url = await this.getActiveTab();
    if (url) {
      this.appState.connectedSites.remove(url);
      console.log(toJS(this.appState.connectedSites));
      this.appState.connectionStatus = false;
    }
  }

  private getActiveTab(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
        if (tabs.length && tabs[0].url) {
          const url = new URL(tabs[0].url);
          resolve(url.hostname);
        }
        resolve(null);
      });
    });
  }
}
