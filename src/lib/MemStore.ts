import { IObservableArray, observable } from 'mobx';
import { SignMessage } from '../background/SignMessageManager';

export class AppState {
  @observable isUnlocked: boolean = false;
  @observable connectionStatus: boolean = false;
  @observable connectionRequested: boolean = false;
  @observable connectedSites: IObservableArray<string> = observable.array<
    string
  >([], { deep: true });
  @observable hasCreatedVault: boolean = false;
  @observable selectedUserAccount: SignKeyPairWithAlias | null = null;
  userAccounts: IObservableArray<SignKeyPairWithAlias> = observable.array<
    SignKeyPairWithAlias
  >([], { deep: true });
  @observable toSignMessages: IObservableArray<SignMessage> = observable.array<
    SignMessage
  >([], { deep: true });
}
