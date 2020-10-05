import { AppState } from '../lib/MemStore';
import { browser } from 'webextension-polyfill-ts';

export function updateBadge(appState: AppState) {
  let label = '';
  let count = appState.toSignMessages.length;
  let request = appState.connectionRequested;
  if (count) {
    label = String(count);
  }
  if (request) {
    label = '1';
  }
  browser.browserAction.setBadgeText({ text: label });
  browser.browserAction.setBadgeBackgroundColor({ color: 'red' });
}
