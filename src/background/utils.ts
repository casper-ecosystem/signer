import { AppState } from '../lib/MemStore';
import { browser } from 'webextension-polyfill-ts';

export type eventType =
  | 'initialState'
  | 'connected'
  | 'disconnected'
  | 'tabUpdated'
  | 'activeKeyChanged'
  | 'locked'
  | 'unlocked';

export function updateBadge(appState: AppState) {
  let label = '';
  let count =
    appState.unsignedDeploys.length > 0
      ? appState.unsignedDeploys.length
      : appState.unsignedMessages.length > 0
      ? appState.unsignedMessages.length
      : undefined;
  if (appState.connectionRequested && !appState.connectionStatus) {
    label = '1';
  } else if (count) {
    label = String(count);
  }
  browser.browserAction.setBadgeText({ text: label });
  browser.browserAction.setBadgeBackgroundColor({ color: 'red' });
}

export function updateStatusEvent(appState: AppState, msg: eventType) {
  if (!appState.currentTab) return;
  const savedSite = appState.connectedSites.find(
    s => s.url === appState.currentTab!.url
  );
  if (savedSite) {
    const { activeUserAccount, isUnlocked } = appState;
    const { isConnected } = savedSite;
    chrome.tabs.sendMessage(appState.currentTab!.tabId, {
      name: msg,
      detail: {
        isUnlocked,
        isConnected: isUnlocked ? savedSite.isConnected : null,
        activeKey:
          isConnected && isUnlocked && activeUserAccount
            ? activeUserAccount.keyPair.publicKey.toHex()
            : null
      }
    });
  }
}

export function truncateString(
  longString: string,
  startChunk: number,
  endChunk: number
): string {
  if (!longString) throw new Error('Error parsing long string.');
  return (
    longString.substring(0, startChunk) +
    '...' +
    longString.substring(longString.length - endChunk)
  );
}

export function numberWithSpaces(num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function motesToCSPR(motes: number) {
  return motes / 1000000000;
}
