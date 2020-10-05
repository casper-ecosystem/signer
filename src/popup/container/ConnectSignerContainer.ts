import { AppState } from '../../lib/MemStore';
import { BackgroundManager } from '../BackgroundManager';
import { computed } from 'mobx';
import { browser } from 'webextension-polyfill-ts';

class ConnectSignerContainer {
  constructor(
    private backgroundManager: BackgroundManager,
    private appState: AppState
  ) {}

  @computed
  get connectionStatus() {
    return this.appState.connectionStatus;
  }

  @computed
  get connectionRequested() {
    return this.appState.connectionRequested;
  }

  async connectToSite() {
    console.log('Attempting to connect to Clarity...');
    if (this.connectionStatus) {
      throw new Error('Already connected to site');
    }
    await this.backgroundManager.connectToSite();
    console.log(this.connectionStatus ? 'Connected!' : 'Connection failed');
  }

  async disconnectFromSite() {
    console.log('Disconnecting from Clarity...');
    await this.backgroundManager.disconnectFromSite();
    console.log(
      !this.connectionStatus ? 'Disconnected' : 'Disconnection failed'
    );
  }

  async resetConnectionRequest() {
    await this.backgroundManager.resetConnectionRequest();
  }

  async cancel() {
    await this.resetConnectionRequest();
    await this.closeWindow();
  }

  async open() {
    await this.openWindow();
  }

  private async closeWindow() {
    let views = await browser.extension.getViews();
    let popup = views[1].window;
    popup.close();
  }

  private async openWindow() {
    let views = await browser.extension.getViews();
    let popup = views[1].window;
    popup.open();
  }
}

export default ConnectSignerContainer;
