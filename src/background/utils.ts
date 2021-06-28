import { AppState } from '../lib/MemStore';
import { browser } from 'webextension-polyfill-ts';

export function updateBadge(appState: AppState) {
  let label = '';
  let count = appState.unsignedDeploys.length;
  if (appState.connectionRequested) {
    label = '1';
  } else if (count) {
    label = String(count);
  }
  browser.browserAction.setBadgeText({ text: label });
  browser.browserAction.setBadgeBackgroundColor({ color: 'red' });
}

export function updateStatusEvent(appState: AppState, msg: string) {
  if (!appState.currentTab) return;
  const savedSite = appState.connectedSites.find(
    s => s.url === appState.currentTab!.url
  );
  if (savedSite) {
    const account = appState.selectedUserAccount;
    chrome.tabs.sendMessage(appState.currentTab!.tabId, {
      msg,
      data: {
        isUnlocked: appState.isUnlocked,
        isConnected: savedSite.isConnected,
        activeKey: account ? account.KeyPair.publicKey.toAccountHex() : null
      }
    });
  }
}
