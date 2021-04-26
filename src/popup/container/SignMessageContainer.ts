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
  get deployToSign() {
    if (this.appState.unsignedDeploys.length > 0) {
      return this.appState.unsignedDeploys[0];
    }
    return null;
  }

  async signDeploy() {
    let deploy = this.deployToSign;
    if (deploy === null) {
      throw new Error('No deploy to sign!');
    }
    await this.backgroundManager.signDeploy(deploy.id);
    this.closeWindow();
  }

  async cancel() {
    const deploy = this.deployToSign;
    if (deploy === null) {
      throw new Error('No deploy to sign!');
    }
    await this.backgroundManager.rejectSignMessage(deploy.id);
    this.closeWindow();
  }

  private async closeWindow() {
    let views = await browser.extension.getViews();
    let popup = views[1].window;
    popup.close();
  }
}

export default SignMessageContainer;
