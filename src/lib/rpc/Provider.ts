import { browser } from 'webextension-polyfill-ts';
import { Rpc } from './rpc';
import SignMessageManager from '../../background/SignMessageManager';
import ConnectionManager from '../../background/ConnectionManager';
import AuthController from '../../background/AuthController';

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
  signMessageManager: SignMessageManager,
  connectionManager: ConnectionManager,
  authController: AuthController,
  logMessages: boolean = false
) {
  rpc = new Rpc({
    addListener: browser.runtime.onMessage.addListener,
    logMessages,
    destination: 'page',
    source: 'background'
  });
  rpc.register(
    'sign',
    signMessageManager.addUnsignedMessageBase16Async.bind(signMessageManager)
  );
  rpc.register(
    'getSelectedPublicKeyBase64',
    signMessageManager.getSelectedPublicKeyBase64.bind(signMessageManager)
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
  // Used in testing
  rpc.register(
    'resetExistingVault',
    authController.resetVault.bind(authController)
  );
  rpc.register(
    'createNewVault',
    authController.createNewVault.bind(authController)
  );
  rpc.register(
    'hasCreatedVault',
    connectionManager.hasCreatedVault.bind(connectionManager)
  );
  rpc.register(
    'createTestAccount',
    authController.importUserAccount.bind(authController)
  );
  rpc.register(
    'getToSignMessageID',
    signMessageManager.getToSignMessageID.bind(signMessageManager)
  );
  rpc.register(
    'signTestDeploy',
    signMessageManager.approveMsg.bind(signMessageManager)
  );
}
