import { AppState } from '../lib/MemStore';
import { browser } from 'webextension-polyfill-ts';

export function updateBadge(appState: AppState) {
  let label = '';
  let count = appState.toSignMessages.length;
  if (appState.connectionRequested) {
    label = '1';
  } else if (count) {
    label = String(count);
  }
  browser.browserAction.setBadgeText({ text: label });
  browser.browserAction.setBadgeBackgroundColor({ color: 'red' });
}
