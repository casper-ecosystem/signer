import { AppState } from '../lib/MemStore';
import { toJS } from 'mobx';
import PopupManager from '../background/PopupManager';

export interface Tab {
  tabId: number;
  url: string;
}

const parseTabURL = (url: string | undefined): string | null => {
  if (url) {
    const parsed = new URL(url);
    return parsed.hostname;
  }
  return null;
};

export default class ConnectionManager {
  private popupManager: PopupManager;

  constructor(private appState: AppState) {
    this.popupManager = new PopupManager();
    this.appState = appState;

    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (
        this.appState.currentTab &&
        this.appState.currentTab.tabId === tabId &&
        changeInfo.status === 'complete'
      ) {
        const url = parseTabURL(tab.url);
        this.appState.currentTab = url ? { tabId, url } : null;
      }
    });

    chrome.tabs.onActivated.addListener(async activeInfo => {
      const currentUrl = await this.getActiveTab();
      if (currentUrl) {
        this.appState.currentTab = { tabId: activeInfo.tabId, url: currentUrl };
      }
    });
  }

  public isConnected() {
    const url = this.appState.currentTab && this.appState.currentTab.url;
    if (url) {
      return this.appState.connectedSites.includes(url);
    }
    return false;
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
    const tab = this.appState.currentTab;
    if (tab && tab.url) {
      this.appState.connectedSites.push(tab.url);
      this.popupManager.closePopup();
    }
  }

  public async disconnectFromSite(site?: string) {
    const url =
      site || (this.appState.currentTab && this.appState.currentTab.url);
    if (url) {
      this.appState.connectedSites.remove(url);
      return;
    }
  }

  private getActiveTab(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
        if (tabs.length && tabs[0].url) {
          resolve(parseTabURL(tabs[0].url));
        }
        resolve(null);
      });
    });
  }
}
