// size of the popup

import { browser } from 'webextension-polyfill-ts';

export type openPurpose =
  | 'connect'
  | 'signDeploy'
  | 'signMessage'
  | 'importAccount'
  | 'noAccount';

const normalPopupWidth = 300;
const normalPopupHeight = 480;
const expandedPopupHeight = 820;
// Pads around popup window
const popupBuffer = {
  right: 20,
  top: 40
};

interface PopupWindow {
  windowId: number;
  openFor: openPurpose;
}

let popupWindow: PopupWindow | null = null;

/**
 * A Class to manager Popup
 * Provide inject and background a way to show popup.
 */
export default class PopupManager {
  constructor() {
    browser.windows.onRemoved.addListener(async windowId => {
      if (popupWindow?.windowId !== windowId) return;
      popupWindow = null;
    });
  }
  async openPopup(openFor: openPurpose) {
    if (!popupWindow) {
      // No popup window open
      browser.windows
        .getCurrent()
        .then(window => {
          let windowWidth =
            window.width === undefined || null
              ? normalPopupWidth
              : window.width;
          let xOffset = window.left === undefined || null ? 0 : window.left;
          let yOffset = window.top === undefined || null ? 0 : window.top;
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
            .then(newPopup => {
              if (newPopup.id) {
                popupWindow = {
                  windowId: newPopup.id,
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
      // There is a window open already
      if (popupWindow.openFor == openFor) {
        // Current window is open to the required page
        let w = await browser.windows.get(popupWindow.windowId);
        if (w.id) {
          browser.windows.update(w.id, {
            // Bring current window to the front
            focused: true,
            drawAttention: true
          });
        }
      } else {
        // Current window is open to another page
        await this.closePopup(popupWindow.windowId);
        await this.openPopup(openFor);
      }
    }
  }

  async closePopup(windowId?: number) {
    try {
      if (windowId) {
        await browser.windows.remove(windowId);
      } else {
        let w = await browser.windows.getCurrent();
        if (w.type === 'popup' && w.id) {
          await browser.windows.remove(w.id);
        }
      }
      // Reset popup state
      popupWindow = null;
    } catch (error) {
      throw error;
    }
  }
}
