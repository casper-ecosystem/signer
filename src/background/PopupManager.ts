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
        let width = window.width ? window.width : 300;
        browser.windows.create({
          url:
            purpose === 'import'
              ? 'chrome-extension://clibiolanfdjhcccambhedamdankekik/index.html?#/import'
              : 'chrome-extension://clibiolanfdjhcccambhedamdankekik/index.html?#/',
          type: 'popup',
          height: 480,
          width: 300,
          left: width - 300 - 20,
          top: 80
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
