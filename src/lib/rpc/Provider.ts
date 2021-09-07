import { browser } from 'webextension-polyfill-ts';
import { Rpc } from './rpc';
import SigningManager from '../../background/SigningManager';
import ConnectionManager from '../../background/ConnectionManager';

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
  signingManager: SigningManager,
  connectionManager: ConnectionManager,
  logMessages: boolean = false
) {
  rpc = new Rpc({
    addListener: browser.runtime.onMessage.addListener,
    logMessages,
    destination: 'page',
    source: 'background'
  });
  rpc.register('sign', signingManager.signDeploy.bind(signingManager));
  rpc.register('signMessage', signingManager.signMessage.bind(signingManager));
  rpc.register(
    'getActivePublicKey',
    signingManager.getActivePublicKey.bind(signingManager)
  );
  rpc.register(
    'isConnected',
    connectionManager.isConnected.bind(connectionManager)
  );
  rpc.register(
    'requestConnection',
    connectionManager.requestConnection.bind(connectionManager)
  );
  rpc.register(
    'connectToSite',
    connectionManager.connectToSite.bind(connectionManager)
  );
  rpc.register(
    'disconnectFromSite',
    connectionManager.disconnectFromSite.bind(connectionManager)
  );
  rpc.register(
    'removeSite',
    connectionManager.removeSite.bind(connectionManager)
  );
  rpc.register(
    'getVersion',
    connectionManager.getVersion.bind(connectionManager)
  );
}
