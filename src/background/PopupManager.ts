// size of the popup

import { browser } from 'webextension-polyfill-ts';

const width = 300;
const height = 460;

/**
 * A Class to manager Popup
 * Provide inject and background a way to show popup.
 */
export class PopupManager {
  private popupId: number | null = null;

  constructor() {}

  public async show() {
    let popup = await this.findPopup();

    if (popup !== null) {
      browser.windows.update(popup.id!, { focused: true });
    } else {
      popup = await browser.windows.create({
        height,
        type: 'popup',
        url: 'index.html',
        width
      });
      this.popupId = popup.id!;
    }
  }

  private async findPopup() {
    const windows = await browser.windows.getAll({
      windowTypes: ['popup']
    });

    const ownWindows = windows.filter(w => w.id === this.popupId);

    if (ownWindows.length > 0) {
      return ownWindows[0];
    } else {
      return null;
    }
  }
}
