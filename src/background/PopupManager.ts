// size of the popup

import { browser } from 'webextension-polyfill-ts';

/**
 * A Class to manager Popup
 * Provide inject and background a way to show popup.
 */
export default class PopupManager {
  openPopup(purpose: 'connect' | 'sign' | 'import') {
    browser.windows
      .getCurrent()
      .then(window => {
        let popupWidth = 300;
        let bufferRight = 20;
        let bufferTop = 40;
        let windowWidth =
          window.width === undefined || null ? 300 : window.width;
        let xOffset = window.left === undefined || null ? 0 : window.left;
        let yOffset = window.top === undefined || null ? 0 : window.top;
        browser.windows.create({
          url: purpose === 'import' ? 'index.html?#/import' : 'index.html?#/',
          type: 'popup',
          height: 480,
          width: 300,
          left: windowWidth + xOffset - popupWidth - bufferRight,
          top: yOffset + bufferTop
        });
      })
      .catch(() => {
        var title, message;
        if (purpose === 'connect') {
          title = 'Connection Request';
          message = 'Open Signer to Approve or Reject Connection';
        } else if (purpose === 'sign') {
          title = 'Signature Request';
          message = 'Open Signer to Approve or Cancel Signing';
        } else {
          throw new Error('Purpose for alert message not found!');
        }
        browser.notifications.create({
          title: title,
          iconUrl: browser.extension.getURL('logo64.png'),
          message: message,
          type: 'basic'
        });
      });
  }

  closePopup() {
    browser.windows
      .getCurrent()
      .then(window => {
        if (window.type === 'popup' && window.id !== undefined) {
          browser.windows.remove(window.id);
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error('Unable to close popup!');
      });
  }
}
