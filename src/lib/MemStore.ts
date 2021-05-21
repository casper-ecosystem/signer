import { IObservableArray, observable, computed } from 'mobx';
import { SignMessage } from '../background/SignMessageManager';
import { Tab, Site } from '../background/ConnectionManager';

export class AppState {
  @observable isUnlocked: boolean = false;
  @observable currentTab: Tab | null = null;
  @computed get connectionStatus(): boolean {
    const url = this.currentTab && this.currentTab.url;
    if (url) {
      return this.connectedSites.some(
        site => site.url === url && site.isConnected
      );
    }
    return false;
  }
  @observable connectionRequested: boolean = false;
  @observable connectedSites: IObservableArray<Site> = observable.array<Site>(
    [],
    { deep: true }
  );
  @observable hasCreatedVault: boolean = false;
  @observable selectedUserAccount: SignKeyPairWithAlias | null = null;
  userAccounts: IObservableArray<SignKeyPairWithAlias> = observable.array<
    SignKeyPairWithAlias
  >([], { deep: true });
  @observable toSignMessages: IObservableArray<SignMessage> = observable.array<
    SignMessage
  >([], { deep: true });
}
