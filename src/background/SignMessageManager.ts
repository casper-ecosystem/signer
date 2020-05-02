import * as events from 'events';
import { AppState } from '../lib/MemStore';
import { encodeBase64 } from 'tweetnacl-ts';
import * as nacl from 'tweetnacl-ts';

type SignMessageStatus = 'unsigned' | 'signed' | 'rejected';

export interface SignMessage {
  id: number;
  data: string;
  rawSig?: string;
  time: number;
  status: SignMessageStatus;
}

/**
 * Sign Message Manager
 *
 * Algorithm:
 *    1. Injected script call `SignMessageManager.addUnsignedMessageAsync`, we return a Promise, inside the Promise, we will
 *       construct a message and assign it a unique id msgId and then we set up a event listen for `${msgId}:finished`.
 *       Resolve or reject when the event emits.
 *    2. Popup call `SignMessageManager.{rejectMsg|approveMsg}` either to reject or commit the signature request,
 *       and both methods will fire a event `${msgId}:finished`, which is listened by step 1.
 */
export default class SignMessageManager extends events.EventEmitter {
  private messages: SignMessage[];
  private nextId: number;

  constructor(private appState: AppState) {
    super();
    this.messages = [];
    this.nextId = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
  }

  public addUnsignedMessageBase16Async(rawMessageBase16: string) {
    return new Promise((resolve, reject) => {
      const msgId = this.addUnsignedMessage(rawMessageBase16);
      // await finished, listen to finish event, which will be fired by `rejectMsg` or `signMsg`.
      this.once(`${msgId}:finished`, data => {
        switch (data.status) {
          case 'signed':
            return resolve(data.rawSig);
          case 'rejected':
            return reject(new Error('User denied message signature.'));
          default:
            return reject(
              new Error(
                `Message Signature: Unknown problem: ${data.toString()}`
              )
            );
        }
      });
    });
  }

  // return base64 encoded public key of the current selected account
  public getSelectedPublicKeyBase64() {
    let pk = this.appState.selectedUserAccount?.signKeyPair.publicKey;
    if (pk) {
      return encodeBase64(pk);
    }
    return undefined;
  }

  // Reject signature request
  public rejectMsg(msgId: number) {
    const msg = this.getMsg(msgId);
    msg.status = 'rejected';
    this.saveAndEmitEventIfNeeded(msg);
  }

  // Approve signature request
  public approveMsg(msgId: number) {
    const msg = this.getMsg(msgId);
    if (!this.appState.selectedUserAccount) {
      throw new Error(`Please select the account firstly`);
    }
    let sig = nacl.sign_detached(
      nacl.decodeHex(msg.data),
      this.appState.selectedUserAccount.signKeyPair.secretKey
    );

    msg.rawSig = nacl.encodeBase64(sig);
    msg.status = 'signed';
    this.saveAndEmitEventIfNeeded(msg);
  }

  private createId() {
    this.nextId = this.nextId % Number.MAX_SAFE_INTEGER;
    return this.nextId++;
  }

  private saveAndEmitEventIfNeeded(msg: SignMessage) {
    let status = msg.status;
    this.updateMsg(msg);
    if (status === 'rejected' || status === 'signed') {
      // fire finished event, so that the Promise can resolve and return result to RPC caller
      this.emit(`${msg.id}:finished`, msg);
    }
  }

  private updateMsg(msg: SignMessage) {
    const index = this.messages.findIndex(message => message.id === msg.id);
    if (index === -1) {
      throw new Error(`Could not find message with id: ${msg.id}`);
    }
    this.messages[index] = msg;
    this.updateAppState();
  }

  /**
   * Construct a SignMessage and add it to AppState.toSignMessages
   * @param rawMessageBase16: the base16 encoded message that plugin received to sign
   */
  private addUnsignedMessage(rawMessageBase16: string) {
    const time = new Date().getTime();
    const msgId = this.createId();
    const msg: SignMessage = {
      id: msgId,
      data: rawMessageBase16,
      time: time,
      status: 'unsigned'
    };

    // Add msg to local cached message and push it to UI if necessary.
    this.messages.push(msg);
    this.updateAppState();

    return msgId;
  }

  // Update toSignMessage, and it will trigger the autorun in background.ts, and send updated state to Popup
  private updateAppState() {
    const unsignedMessages = this.messages.filter(
      msg => msg.status === 'unsigned'
    );
    this.appState.toSignMessages.replace(unsignedMessages);
  }

  /**
   * Find msg by msgId
   * @param msgId
   * @throws Error if there is no message with the msgId
   */
  private getMsg(msgId: number): SignMessage {
    let signMessage = this.messages.find(msg => msg.id === msgId);
    if (signMessage === undefined) {
      throw new Error(`Could not find message with id: ${msgId}`);
    }
    return signMessage;
  }
}
