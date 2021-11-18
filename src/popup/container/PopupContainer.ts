import { BackgroundManager } from '../BackgroundManager';
import { openPurpose } from '../../background/PopupManager';
// Container for managing instances of the Signer.
// Acts as an interface between the UI and the background controllers.

export default class PopupContainer {
  constructor(private backgroundManager: BackgroundManager) {}

  callOpenPopup = async (reasonToOpen: openPurpose) => {
    await this.backgroundManager.callOpenPopup(reasonToOpen);
  };

  callClosePopup = async () => {
    await this.backgroundManager.callClosePopup();
  };
}
