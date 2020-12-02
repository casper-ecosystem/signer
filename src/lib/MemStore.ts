import { IObservableArray, observable } from 'mobx';
import { SignMessage } from '../background/SignMessageManager';

export class AppState {
  @observable isUnlocked: boolean = false;
  @observable connectionStatus: boolean = false;
  @observable connectionRequested: boolean = false;
  @observable hasCreatedVault: boolean = false;
  @observable selectedUserAccount: SignKeyPairWithAlias | null = null;
  userAccounts: IObservableArray<SignKeyPairWithAlias> = observable.array<
    SignKeyPairWithAlias
  >([], { deep: true });
  @observable toSignMessages: IObservableArray<SignMessage> = observable.array<
    SignMessage
  >([], { deep: true });
}

// REMOVE
// add rpc method to grab toSignMessages and then pass the [0] to signMessageManager.approveMsg(msgID)
