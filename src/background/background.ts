// @ts-ignore
const a = '';
// import AccountController from './AuthController';
// import { browser } from 'webextension-polyfill-ts';
// import { Rpc } from '../lib/rpc/rpc';
// import { AppState } from '../lib/MemStore';
// import { autorun } from 'mobx';
// import SigningManager from './SigningManager';
// import ConnectionManager from './ConnectionManager';
// import { updateBadge } from './utils';
// import { setupInjectPageAPIServer } from '../lib/rpc/Provider';
// import PopupManager from './PopupManager';
//
// const appState = new AppState();
// const popupManager = new PopupManager(appState);
// const accountController = new AccountController(appState);
// const signingManager = new SigningManager(appState, popupManager);
// const connectionManager = new ConnectionManager(appState);
//
// initialize().catch(console.log);
//
// async function initialize() {
//   await setupPopupAPIServer();
//   // Setup RPC server for inject page
//   setupInjectPageAPIServer(signingManager, connectionManager);
// }
//
// // Setup RPC server for Popup
// async function setupPopupAPIServer() {
//   const rpc = new Rpc({
//     addListener: browser.runtime.onMessage.addListener,
//     destination: 'popup',
//     postMessage: browser.runtime.sendMessage,
//     source: 'background'
//   });
//   // once appState update, send updated appState to popup
//   autorun(() => {
//     rpc.call<void>('popup.updateState', appState).catch(e => {
//       console.log(e);
//     });
//     updateBadge(appState);
//   });
//   rpc.register(
//     'account.resetSecurityCheckup',
//     accountController.resetIsTimeToSecurityCheckup.bind(accountController)
//   );
//   rpc.register(
//     'account.unlock',
//     accountController.unlock.bind(accountController)
//   );
//   rpc.register(
//     'account.createNewVault',
//     accountController.createNewVault.bind(accountController)
//   );
//   rpc.register('account.lock', accountController.lock.bind(accountController));
//   rpc.register(
//     'account.importUserAccount',
//     accountController.importUserAccount.bind(accountController)
//   );
//   rpc.register(
//     'account.removeUserAccount',
//     accountController.removeUserAccount.bind(accountController)
//   );
//   rpc.register(
//     'account.renameUserAccount',
//     accountController.renameUserAccount.bind(accountController)
//   );
//   rpc.register(
//     'account.reorderAccount',
//     accountController.reorderAccount.bind(accountController)
//   );
//   rpc.register(
//     'account.isBackedUp',
//     accountController.isBackedUp.bind(accountController)
//   );
//   rpc.register(
//     'account.getActiveUserAccount',
//     accountController.getActiveUserAccount.bind(accountController)
//   );
//   rpc.register(
//     'account.getActivePublicKeyHex',
//     accountController.getActivePublicKeyHex.bind(accountController)
//   );
//   rpc.register(
//     'account.getActiveAccountHash',
//     accountController.getActiveAccountHash.bind(accountController)
//   );
//   rpc.register(
//     'account.getPublicKeyHexByAlias',
//     accountController.getPublicKeyHexByAlias.bind(accountController)
//   );
//   rpc.register(
//     'account.getAccountHashByAlias',
//     accountController.getAccountHashByAlias.bind(accountController)
//   );
//   rpc.register(
//     'account.downloadAccountKeys',
//     accountController.downloadAccountKeys.bind(accountController)
//   );
//   rpc.register(
//     'account.resetVault',
//     accountController.resetVault.bind(accountController)
//   );
//   rpc.register(
//     'account.resetLockout',
//     accountController.resetLockout.bind(accountController)
//   );
//   rpc.register(
//     'account.startLockoutTimer',
//     accountController.startLockoutTimer.bind(accountController)
//   );
//   rpc.register(
//     'account.resetLockoutTimer',
//     accountController.resetLockoutTimer.bind(accountController)
//   );
//   rpc.register(
//     'account.switchToAccount',
//     accountController.switchToAccount.bind(accountController)
//   );
//   rpc.register('background.getState', () => {
//     return appState;
//   });
//   rpc.register(
//     'sign.signDeploy',
//     signingManager.approveSignDeploy.bind(signingManager)
//   );
//   rpc.register(
//     'sign.rejectSignDeploy',
//     signingManager.rejectSignDeploy.bind(signingManager)
//   );
//   rpc.register(
//     'sign.parseDeployData',
//     signingManager.parseDeployData.bind(signingManager)
//   );
//   rpc.register(
//     'sign.approveSigningMessage',
//     signingManager.approveSigningMessage.bind(signingManager)
//   );
//   rpc.register(
//     'sign.cancelSigningMessage',
//     signingManager.cancelSigningMessage.bind(signingManager)
//   );
//   rpc.register(
//     'connection.requestConnection',
//     connectionManager.requestConnection.bind(connectionManager)
//   );
//   rpc.register(
//     'connection.resetConnectionRequest',
//     connectionManager.resetConnectionRequest.bind(connectionManager)
//   );
//   rpc.register(
//     'connection.connectToSite',
//     connectionManager.connectToSite.bind(connectionManager)
//   );
//   rpc.register(
//     'connection.disconnectFromSite',
//     connectionManager.disconnectFromSite.bind(connectionManager)
//   );
//   rpc.register(
//     'connection.removeSite',
//     connectionManager.removeSite.bind(connectionManager)
//   );
//   rpc.register(
//     'eventBus',
//     connectionManager.removeSite.bind(connectionManager)
//   );
//   rpc.register(
//     'account.confirmPassword',
//     accountController.confirmPassword.bind(accountController)
//   );
//   rpc.register(
//     'connection.isIntegratedSite',
//     connectionManager.isIntegratedSite.bind(connectionManager)
//   );
//   rpc.register(
//     'account.configureTimeout',
//     accountController.configureTimeout.bind(accountController)
//   );
//   rpc.register('popup.openPopup', popupManager.openPopup.bind(popupManager));
//   rpc.register('popup.closePopup', popupManager.closePopup.bind(popupManager));
// }
