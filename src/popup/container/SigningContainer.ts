import { BackgroundManager } from '../BackgroundManager';
import { AppState } from '../../lib/MemStore';
import { browser } from 'webextension-polyfill-ts';
import { computed } from 'mobx';

class SigningContainer {
  constructor(
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

  @computed
  get messageToSign() {
    if (this.appState.unsignedMessages.length > 0) {
      return this.appState.unsignedMessages[0];
    }
    return null;
  }

  async parseDeployData(deployId: number) {
    return await this.backgroundManager.parseDeployData(deployId);
  }

  async signDeploy(deployId: number) {
    await this.backgroundManager.signDeploy(deployId);
    // this.closeWindow();
  }

  async cancel(deployId: number) {
    await this.backgroundManager.rejectSignDeploy(deployId);
    // this.closeWindow();
  }

  async approveSigningMessage(messageId: number) {
    await this.backgroundManager.approveSigningMessage(messageId);
  }

  async cancelSigningMessage(messageId: number) {
    await this.backgroundManager.cancelSigningMessage(messageId);
  }

  private async closeWindow() {
    let views = await browser.extension.getViews();
    let popup = views[1].window;
    popup.close();
  }
}

export default SigningContainer;
