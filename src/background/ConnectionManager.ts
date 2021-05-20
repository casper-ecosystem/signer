import { AppState } from '../lib/MemStore';
import PopupManager from '../background/PopupManager';

export interface Tab {
  tabId: number;
  url: string;
}

export interface Site {
  url: string;
  isConnected: boolean;
}

const parseTabURL = (url: string | undefined): string | undefined => {
  if (url) {
    const parsed = new URL(url);
    return parsed.hostname;
  }
  return undefined;
};

export default class ConnectionManager {
  private popupManager: PopupManager;

  constructor(private appState: AppState) {
    this.popupManager = new PopupManager();
    this.appState = appState;

    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete') {
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
      return this.appState.connectedSites.some(
        site => site.url === url && site.isConnected
      );
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

  public async connectToSite(site?: string) {
    const tab = this.appState.currentTab;
    const url = site || (tab && tab.url);
    if (url) {
      const isPresent = this.appState.connectedSites.some(d => d.url === url);

      if (isPresent) {
        this.appState.connectedSites.map(d => {
          if (d.url === url) d.isConnected = true;
        });
        return;
      }

      this.appState.connectedSites.push({ url: url, isConnected: true });
      this.popupManager.closePopup();
    }
  }

  public async disconnectFromSite(site?: string) {
    const tab = this.appState.currentTab;
    const url = site || (tab && tab.url);
    if (url) {
      this.appState.connectedSites.map(d => {
        if (d.url === url) d.isConnected = false;
      });
      return;
    }
  }

  public async removeSite(url: string) {
    const filtered = this.appState.connectedSites.filter(d => d.url !== url);
    this.appState.connectedSites.replace(filtered);
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
