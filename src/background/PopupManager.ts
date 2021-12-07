import { AppState } from '../lib/MemStore';
import SigningManager from './SigningManager';
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
const expandedPopupWidth = 430;
// Pads around popup window
const popupBuffer = {
  right: 20,
  top: 40
};

interface PopupWindow {
  id: number;
  openFor: openPurpose;
  signingId: number | undefined;
}

let popupWindow: PopupWindow | null = null;

/**
 * A Class to manager Popup
 * Provide inject and background a way to show popup.
 */
export default class PopupManager {
  private signingManager: SigningManager;

  constructor(appState: AppState) {
    this.signingManager = new SigningManager(appState, this);
    browser.windows.onRemoved.addListener(async id => {
      if (id === popupWindow?.id && popupWindow.signingId) {
        await this.clearUnsignedItem(popupWindow.signingId);
      }
      popupWindow = null;
    });
  }

  async openPopup(openFor: openPurpose, signingId?: number) {
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
              width:
                openFor === 'signDeploy'
                  ? expandedPopupWidth
                  : normalPopupWidth,
              left:
                windowWidth + xOffset - normalPopupWidth - popupBuffer.right,
              top: yOffset + popupBuffer.top
            })
            .then(window => {
              if (window.id) {
                popupWindow = {
                  id: window.id,
                  openFor,
                  signingId
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
        this.openPopup(openFor, signingId);
      }
    }
  }

  async closePopup(windowId?: number, signingId?: number) {
    try {
      if (signingId) this.clearUnsignedItem(signingId);
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

  private async clearUnsignedItem(id: number) {
    if (!popupWindow) return;
    try {
      switch (popupWindow.openFor) {
        case 'signDeploy':
          await this.signingManager.rejectSignDeploy(id);
          break;
        case 'signMessage':
          await this.signingManager.cancelSigningMessage(id);
          break;
        default:
          break;
      }
    } catch (err) {
      console.info(
        `Signer: Cancelled ${popupWindow.openFor
          .substring(4)
          .toLowerCase()} signing due to window closure.`
      );
    }
  }
}
