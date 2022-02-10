// size of the popup

import { browser } from 'webextension-polyfill-ts';
import { PurposeForOpening, popupDimensions } from '../shared';

// Pads around popup window
const popupBuffer = {
  right: 20,
  top: 40
};

interface PopupWindow {
  windowId: number;
  purposeForOpening: PurposeForOpening;
}

// this acts as a singleton
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

  async openPopup(purposeForOpening: PurposeForOpening) {
    if (!popupWindow) {
      // No popup window open
      browser.windows
        .getCurrent()
        .then(window => {
          let windowWidth = window.width ?? popupDimensions.defaultWidth;
          let xOffset = window.left ?? 0;
          let yOffset = window.top ?? 0;
          let popupWidth =
            purposeForOpening === PurposeForOpening.SignDeploy
              ? popupDimensions.expandedWidth
              : popupDimensions.defaultWidth;
          browser.windows
            .create({
              url:
                purposeForOpening === PurposeForOpening.ImportAccount
                  ? 'index.html?#/import'
                  : 'index.html?#/',
              type: 'popup',
              height:
                purposeForOpening === PurposeForOpening.SignDeploy
                  ? popupDimensions.expandedHeight
                  : popupDimensions.defaultHeight,
              width: popupWidth,
              left: windowWidth + xOffset - popupWidth - popupBuffer.right,
              top: yOffset + popupBuffer.top
            })
            .then(newPopup => {
              if (newPopup.id) {
                popupWindow = {
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
      // There is a popup window open already
      if (popupWindow.purposeForOpening === purposeForOpening) {
        // popup window is open to the required page
        let window = await browser.windows.get(popupWindow.windowId);
        if (window.id) {
          browser.windows.update(window.id, {
            // Bring popup window to the front
            focused: true,
            drawAttention: true
          });
        }
      } else {
        // popup window is open to another page
        await this.closePopup(popupWindow.windowId);
        await this.openPopup(purposeForOpening);
      }
    }
  }

  async closePopup(windowId?: number) {
    try {
      if (windowId) {
        await browser.windows.remove(windowId);
      } else {
        // This allows the FE to call close popup without querying for window id to pass.
        let currentWindow = await browser.windows.getCurrent();
        if (currentWindow.type === 'popup' && currentWindow.id) {
          await browser.windows.remove(currentWindow.id);
        }
      }
      // Reset popup state
      popupWindow = null;
    } catch (error) {
      throw error;
    }
  }
}
