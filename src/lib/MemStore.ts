import { IObservableArray, observable } from 'mobx';
import { KeyPairWithAlias } from '../@types/models';
import { deployWithID } from '../background/SignMessageManager';

export class AppState {
  @observable isUnlocked: boolean = false;
  @observable connectionStatus: boolean = false;
  @observable connectionRequested: boolean = false;
  @observable hasCreatedVault: boolean = false;
  @observable selectedUserAccount: KeyPairWithAlias | null = null;
  userAccounts: IObservableArray<KeyPairWithAlias> = observable.array<
    KeyPairWithAlias
  >([], { deep: true });
  @observable unsignedDeploys: IObservableArray<
    deployWithID
  > = observable.array<deployWithID>([], { deep: true });
}
