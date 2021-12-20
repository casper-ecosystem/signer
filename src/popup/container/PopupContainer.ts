import { BackgroundManager } from '../BackgroundManager';
import { openPurpose } from '../../background/PopupManager';

// Container for managing popup instances of the Signer.
// Acts as an interface between the UI and the background controllers.

export default class PopupContainer {
  constructor(private backgroundManager: BackgroundManager) {}

  callOpenPopup = async (reasonToOpen: openPurpose) => {
    await this.backgroundManager.callOpenPopup(reasonToOpen);
  };

  callClosePopup = async (signingId?: number) => {
    await this.backgroundManager.callClosePopup(signingId);
  };
}
