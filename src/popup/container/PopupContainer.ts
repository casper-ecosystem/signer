import { BackgroundManager } from '../BackgroundManager';
import { PurposeForOpening } from '../../shared';
// Container for managing popup instances of the Signer.
// Acts as an interface between the UI and the background controllers.

export default class PopupContainer {
  constructor(private backgroundManager: BackgroundManager) {}

  callOpenPopup = async (purposeForOpening: PurposeForOpening) => {
    await this.backgroundManager.callOpenPopup(purposeForOpening);
  };

  callClosePopup = async (signingId?: number) => {
    await this.backgroundManager.callClosePopup(signingId);
  };
}
