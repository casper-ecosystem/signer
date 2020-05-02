import { browser } from 'webextension-polyfill-ts';
import { Rpc } from './rpc';
import SignMessageManager from '../../background/SignMessageManager';

/*
 * A proxy set up in Content Script
 * Communication:
 *              window.postMessage                   browser.sendMessage
 * inject page --------------------> content script <---------------------> background
 *             <--------------------
 *              window.addEventListener
 */
export function registerContentProxy(logMessages = false) {
  // forward messages from inpage to background
  window.addEventListener('message', receiveMessage, false);

  async function receiveMessage(event: MessageEvent) {
    const msg = event.data;
    if (logMessages) {
      console.log('receive message', msg);
    }
    // validate message type
    if (typeof msg !== 'object') return;
    if (msg.type !== 'request') return;
    msg.value = await browser.runtime.sendMessage(msg.payload);
    msg.type = 'reply';
    window.postMessage(msg, '*');
  }
}

let rpc: Rpc;

// Setup RPC server for inject page
// used in background.ts
export function setupInjectPageAPIServer(
  provider: SignMessageManager,
  logMessages: boolean = false
) {
  rpc = new Rpc({
    addListener: browser.runtime.onMessage.addListener,
    logMessages,
    destination: 'page',
    source: 'background'
  });
  rpc.register('sign', provider.addUnsignedMessageBase16Async.bind(provider));
  rpc.register(
    'getSelectedPublicKeyBase64',
    provider.getSelectedPublicKeyBase64.bind(provider)
  );
}
