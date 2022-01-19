// size of the popup

import { browser } from 'webextension-polyfill-ts';
import { PurposeForOpening } from '../shared';

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
  purposeForOpening: PurposeForOpening;
}

/**
 * A Class to manager Popup
 * Provide inject and background a way to show popup.
 */
export default class PopupManager {
  private popupWindow: PopupWindow | null = null;

  constructor() {
    browser.windows.onRemoved.addListener(async windowId => {
      if (this.popupWindow?.windowId !== windowId) return;
      this.popupWindow = null;
    });
  }
  async openPopup(purposeForOpening: PurposeForOpening) {
    if (!this.popupWindow) {
      // No popup window open
      browser.windows
        .getCurrent()
        .then(window => {
          let windowWidth = window.width ?? normalPopupWidth;
          let xOffset = window.left ?? 0;
          let yOffset = window.top ?? 0;
          browser.windows
            .create({
              url:
                purposeForOpening === PurposeForOpening.ImportAccount
                  ? 'index.html?#/import'
                  : 'index.html?#/',
              type: 'popup',
              height:
                purposeForOpening === PurposeForOpening.SignDeploy
                  ? expandedPopupHeight
                  : normalPopupHeight,
              width: normalPopupWidth,
              left:
                windowWidth + xOffset - normalPopupWidth - popupBuffer.right,
              top: yOffset + popupBuffer.top
            })
            .then(newPopup => {
              if (newPopup.id) {
                this.popupWindow = {
                  windowId: newPopup.id,
                  purposeForOpening
                };
              }
            });
        })
        .catch(() => {
          let title, message;
          switch (purposeForOpening) {
            case PurposeForOpening.Connect:
              title = 'Connection Request';
              message = 'Open Signer to Approve or Reject Connection';
              break;
            case PurposeForOpening.SignDeploy:
            case PurposeForOpening.SignMessage:
              title = 'Signature Request';
              message = 'Open Signer to Approve or Cancel Signing';
              break;
            default:
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
      if (this.popupWindow.purposeForOpening === purposeForOpening) {
        // Current window is open to the required page
        let w = await browser.windows.get(this.popupWindow.windowId);
        if (w.id) {
          browser.windows.update(w.id, {
            // Bring current window to the front
            focused: true,
            drawAttention: true
          });
        }
      } else {
        // Current window is open to another page
        await this.closePopup(this.popupWindow.windowId);
        await this.openPopup(purposeForOpening);
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
      this.popupWindow = null;
    } catch (error) {
      throw error;
    }
  }
}
