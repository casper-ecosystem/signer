import { IObservableArray, observable } from 'mobx';
import { SignMessage } from '../background/SignMessageManager';

export class AppState {
  @observable isUnlocked: boolean = false;
  @observable hasCreatedVault: boolean = false;
  @observable selectedUserAccount: SignKeyPairWithAlias | null = null;
  userAccounts: IObservableArray<SignKeyPairWithAlias> = observable.array<
    SignKeyPairWithAlias
  >([], { deep: true });
  @observable toSignMessages: IObservableArray<SignMessage> = observable.array<
    SignMessage
  >([], { deep: true });
}
