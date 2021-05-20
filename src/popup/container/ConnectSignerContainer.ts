import { AppState } from '../../lib/MemStore';
import { BackgroundManager } from '../BackgroundManager';
import { computed, toJS } from 'mobx';
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
    await this.backgroundManager.connectToSite();
    await this.resetConnectionRequest();
  }

  async disconnectFromSite(site?: string) {
    await this.backgroundManager.disconnectFromSite(site);
    await this.resetConnectionRequest();
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

  @computed
  get connectedSites(): IObservableArray<string> {
    return this.appState.connectedSites;
  }

  @computed
  get currentTab() {
    return this.appState.currentTab;
  }
}

export default ConnectSignerContainer;
