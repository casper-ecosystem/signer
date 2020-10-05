import { BackgroundManager } from '../BackgroundManager';
import ErrorContainer from './ErrorContainer';
import { AppState } from '../../lib/MemStore';
import { browser } from 'webextension-polyfill-ts';
import { computed } from 'mobx';

class SignMessageContainer {
  constructor(
    private errors: ErrorContainer,
    private backgroundManager: BackgroundManager,
    private appState: AppState
  ) {}

  @computed
  get toSignMessage() {
    if (this.appState.toSignMessages.length > 0) {
      return this.appState.toSignMessages[0];
    }
    return null;
  }

  async signMessage() {
    let msg = this.toSignMessage;
    if (msg === null) {
      throw new Error('No message to Sign');
    }
    await this.backgroundManager.signMessage(msg.id);
    this.closeWindow();
  }

  async cancel() {
    const msg = this.toSignMessage;
    if (msg === null) {
      throw new Error('No message to Sign');
    }
    await this.backgroundManager.rejectSignMessage(msg.id);
    this.closeWindow();
  }

  private async closeWindow() {
    let views = await browser.extension.getViews();
    let popup = views[1].window;
    popup.close();
  }
}

export default SignMessageContainer;
