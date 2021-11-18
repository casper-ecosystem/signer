import { browser } from 'webextension-polyfill-ts';

export type openPurpose =
  | 'connect'
  | 'signDeploy'
  | 'signMessage'
  | 'importAccount'
  | 'noAccount';

// Popup window sizes
const normalPopupWidth = 300;
const normalPopupHeight = 480;
const expandedPopupHeight = 820;
// Pads around popup window
const popupBuffer = {
  right: 20,
  top: 40
};

interface PopupWindow {
  id: number;
  openFor: openPurpose;
}

let popupWindow: PopupWindow | null = null;

/**
 * A Class to manager Popup
 * Provide inject and background a way to show popup.
 */
export default class PopupManager {
  constructor() {
    browser.windows.onRemoved.addListener(id => {
      if (id === popupWindow?.id) {
        // switch (popupWindow.openFor) {
        //   case 'signDeploy': {
        //     let id = appState.unsignedDeploys[0].id;
        //     if (id) {
        //       signingManager.rejectSignDeploy(id);
        //     }
        //     break;
        //   };
        //   case 'signMessage': {
        //     let id = appState.unsignedMessages[0].id;
        //     if (id) {
        //       signingManager.cancelSigningMessage(id);
        //     }
        //     break;
        //   };
        //   default: break;
        // }
        popupWindow = null;
      }
    });
  }

  async openPopup(openFor: openPurpose) {
    if (!popupWindow) {
      // There is no window open currently
      browser.windows
        .getCurrent()
        .then(window => {
          let windowWidth = !window.width ? normalPopupWidth : window.width;
          let xOffset = !window.left ? 0 : window.left;
          let yOffset = !window.top ? 0 : window.top;
          browser.windows
            .create({
              url:
                openFor === 'importAccount'
                  ? 'index.html?#/import'
                  : 'index.html?#/',
              type: 'popup',
              height:
                openFor === 'signDeploy'
                  ? expandedPopupHeight
                  : normalPopupHeight,
              width: normalPopupWidth,
              left:
                windowWidth + xOffset - normalPopupWidth - popupBuffer.right,
              top: yOffset + popupBuffer.top
            })
            .then(window => {
              if (window.id) {
                popupWindow = {
                  id: window.id,
                  openFor
                };
              }
            });
        })
        .catch(() => {
          let title, message;
          if (openFor === 'connect') {
            title = 'Connection Request';
            message = 'Open Signer to Approve or Reject Connection';
          } else if (openFor === 'signDeploy' || openFor === 'signMessage') {
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
    } else {
      if (popupWindow.openFor == openFor) {
        // It's open to the same page
        let w = await browser.windows.get(popupWindow.id);
        if (w.id) {
          browser.windows.update(w.id, {
            focused: true,
            drawAttention: true
          });
        }
      } else {
        // It's open to another page - close it and open a new one.
        await this.closePopup(popupWindow.id);
        this.openPopup(openFor);
      }
    }
  }

  // error: "No window with id: 306."

  async closePopup(windowId?: number, signingId?: number) {
    try {
      if (signingId) {
        if (popupWindow?.openFor === 'signDeploy') {
        }
        if (popupWindow?.openFor === 'signMessage') {
        }
      }
      if (windowId) {
        await browser.windows.remove(windowId);
      } else {
        let w = await browser.windows.getCurrent();
        if (w.type === 'popup' && w.id !== undefined) {
          await browser.windows.remove(w.id);
        }
      }
      popupWindow = null;
    } catch (err) {
      throw err;
    }
  }
}
