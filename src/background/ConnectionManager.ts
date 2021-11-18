import { getBucket, Bucket } from '@extend-chrome/storage';
import { AppState } from '../lib/MemStore';
import PopupManager from '../background/PopupManager';
import { updateStatusEvent } from './utils';

export interface Tab {
  tabId: number;
  url: string;
}

export interface Site {
  url: string;
  isConnected: boolean;
}

interface ConnectionManagerStore {
  connectedSites: Site[];
}

const BLACKLIST_PROTOCOLS = ['chrome-extension:', 'chrome:'];

const parseTabURL = (url: string | undefined): URL | undefined => {
  if (url) {
    return new URL(url);
  }
  return undefined;
};

export default class ConnectionManager {
  private store: Bucket<ConnectionManagerStore>;

  constructor(private appState: AppState, private popupManager: PopupManager) {
    this.appState = appState;

    this.store = getBucket<ConnectionManagerStore>('store');

    this.store.get('connectedSites').then(({ connectedSites }) => {
      if (!connectedSites) return;
      const filterIntegratedSites = connectedSites.filter(site =>
        this.isIntegratedSite(site.url)
      );
      this.appState.connectedSites.replace(
        Object.values(filterIntegratedSites)
      );
    });

    // TODO: Might add this for chaning windows focus https://stackoverflow.com/questions/53397465/can-you-detect-moving-between-open-tabs-in-different-windows
    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete') {
        const url = parseTabURL(tab.url);
        if (url && !BLACKLIST_PROTOCOLS.includes(url.protocol)) {
          this.appState.currentTab = url ? { tabId, url: url.hostname } : null;
          updateStatusEvent(appState, 'initialState');
        }
      }
    });

    chrome.tabs.onActivated.addListener(async activeInfo => {
      const currentUrl = await this.getActiveTab();
      if (currentUrl) {
        this.appState.currentTab = { tabId: activeInfo.tabId, url: currentUrl };
        this.appState.isIntegratedSite = this.isIntegratedSite(currentUrl);
        updateStatusEvent(appState, 'tabUpdated');
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
    this.appState.connectionRequested = true;
    this.popupManager.openPopup('connect');
  }

  public resetConnectionRequest() {
    this.appState.connectionRequested = false;
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
      } else {
        this.appState.connectedSites.push({ url: url, isConnected: true });
      }

      this.store.set({ connectedSites: this.appState.connectedSites.toJS() });

      if (tab && tab.tabId) {
        updateStatusEvent(this.appState, 'connected');
      }

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
      this.store.set({ connectedSites: this.appState.connectedSites.toJS() });

      if (tab && tab.tabId) {
        updateStatusEvent(this.appState, 'disconnected');
      }
    }
  }

  public async removeSite(url: string) {
    const filtered = this.appState.connectedSites.filter(d => d.url !== url);
    this.appState.connectedSites.replace(filtered);
    this.store.set({ connectedSites: this.appState.connectedSites.toJS() });
  }

  public getVersion() {
    return chrome.runtime.getManifest().version;
  }

  private getActiveTab(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
        if (tabs.length && tabs[0].url) {
          const url = parseTabURL(tabs[0].url);
          const properActiveTab =
            url && !BLACKLIST_PROTOCOLS.includes(url.protocol);
          resolve(properActiveTab ? url!.hostname : null);
        }
        resolve(null);
      });
    });
  }

  public isIntegratedSite(hostname: string) {
    if (!hostname)
      throw new Error(
        'Could not check for site integration: Hostname was undefined'
      );
    // all sites injected with the the content script
    const injectedSites =
      chrome.runtime.getManifest().content_scripts![0].matches;
    if (!injectedSites)
      throw new Error('Could not retrieve sites from manifest');
    for (let site of injectedSites) {
      let sanitised = site
        .replaceAll('/', '')
        .replace(':', '')
        .replaceAll('*', '');
      if (sanitised.startsWith('.', 0)) {
        sanitised = sanitised.replace('.', '');
      }
      const sanitisedRegex = new RegExp(sanitised);
      if (hostname.match(sanitisedRegex)) {
        return true;
      }
    }
    return false;
  }
}
