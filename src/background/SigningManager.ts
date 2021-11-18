import * as events from 'events';
import { AppState } from '../lib/MemStore';
import PopupManager from './PopupManager';
import {
  DeployUtil,
  encodeBase16,
  CLPublicKey,
  CLPublicKeyType,
  CLByteArrayType,
  CLAccountHashType,
  formatMessageWithHeaders,
  signFormattedMessage
} from 'casper-js-sdk';
import { JsonTypes } from 'typedjson';
export type deployStatus = 'unsigned' | 'signed' | 'failed';
type argDict = { [key: string]: string };

export interface messageWithID {
  id: number;
  messageBytes: Uint8Array;
  messageString: string;
  signingKey: string;
  signature?: Uint8Array;
  status: deployStatus;
  error?: Error;
  pushed?: boolean;
}

export interface deployWithID {
  id: number;
  status: deployStatus;
  deploy: DeployUtil.Deploy | undefined;
  signingKey: string;
  targetKey: string;
  error?: Error;
  pushed?: boolean;
}

export interface DeployData {
  deployHash: string;
  signingKey: string;
  account: string;
  bodyHash: string;
  timestamp: string;
  chainName: string;
  deployType: string;
  gasPrice: number;
  payment: number;
  deployArgs: Object;
}

export default class SigningManager extends events.EventEmitter {
  private unsignedDeploys: deployWithID[];
  private unsignedMessages: messageWithID[];
  private nextId: number;

  constructor(private appState: AppState, private popupManager: PopupManager) {
    super();
    this.unsignedDeploys = [];
    this.unsignedMessages = [];
    this.nextId = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
  }

  /**
   * Helper function to generate IDs to tag deploys with
   * @returns {number} id
   */
  private createId() {
    this.nextId = this.nextId % Number.MAX_SAFE_INTEGER;
    return this.nextId++;
  }

  /**
   * Checks given deploy for signatures
   * @param {DeployUtil.Deploy} deploy
   */
  private checkDeployForSignatures(deploy: DeployUtil.Deploy) {
    // TODO: Implement
  }

  /**
   * Update the AppState with the new list of unsigned deploys.
   * Pushes new state to popup.
   */
  private updateAppState() {
    this.appState.unsignedDeploys.replace(
      this.unsignedDeploys.filter(d => !d.pushed)
    );
    this.unsignedDeploys = this.unsignedDeploys.map(d => ({
      ...d,
      pushed: true
    }));
    this.appState.unsignedMessages.replace(
      this.unsignedMessages.filter(d => !d.pushed)
    );
    this.unsignedMessages = this.unsignedMessages.map(d => ({
      ...d,
      pushed: true
    }));
  }

  /**
   * Retrieve the active public key from vault.
   * Will reject if:
   *  - The Signer is not connected.
   *  - There is no account in the vault.
   * @returns Active public key - hex-encoded with algorithm prefix
   */
  public getActivePublicKey() {
    return new Promise<string>((resolve, reject) => {
      let publicKey = this.appState.activeUserAccount?.keyPair.publicKey;
      if (!this.appState.connectionStatus) {
        return reject(new Error('Please connect to the Signer to read key'));
      }
      if (!this.appState.isUnlocked || this.appState.lockedOut) {
        return reject(new Error('Please unlock the Signer to read key'));
      }
      if (!publicKey) {
        return reject(
          new Error(
            'Please create an account first before attempting to read key'
          )
        );
      }
      if (!publicKey?.isEd25519 && !publicKey?.isSecp256K1())
        reject(new Error('Key was not of expected format!'));
      return resolve(publicKey!.toHex());
    });
  }

  /**
   * Adds the unsigned deploy to the app's queue.
   * @param {JSON} deployJson
   * @returns {number} id for added deploy
   */
  public addUnsignedDeployToQueue(
    deployJson: any,
    sourcePublicKey: string,
    targetPublicKey: string
  ): number {
    const id: number = this.createId();
    try {
      let innerDeploy = DeployUtil.deployFromJson(deployJson);
      if (innerDeploy.ok) {
        this.unsignedDeploys.push({
          id: id,
          status: 'unsigned',
          // Should be safe to unwrap here since Result was ok
          deploy: innerDeploy.unwrap(),
          signingKey: sourcePublicKey,
          targetKey: targetPublicKey
        });
      } else {
        innerDeploy.mapErr(err => {
          throw new Error(err.message);
        });
      }
    } catch (err) {
      throw err;
    }

    this.updateAppState();
    return id;
  }

  /**
   * Signs unsigned deploys from the app's queue
   * @param {any} deploy JSON representation of a deploy - can be constructed using the `DeployUtil.deployToJSON()` method.
   * @param {string} publicKey in hex format with algorithm prefix byte.
   * @returns {DeployJson} Signed JSON representation of the given deploy.
   */
  public signDeploy(
    deploy: { deploy: JsonTypes },
    sourcePublicKeyHex: string, // hex-encoded PublicKey bytes with algo prefix
    targetPublicKeyHex: string
  ): Promise<{ deploy: JsonTypes }> {
    return new Promise((resolve, reject) => {
      // TODO: Need to abstract it to reusable method
      const { currentTab, connectedSites } = this.appState;
      const connected =
        currentTab &&
        connectedSites.some(
          site => site.url === currentTab.url && site.isConnected
        );
      if (!connected) {
        return reject('This site is not connected');
      }

      // Adding the deploy to the queue will update the extension state and UI
      const deployId = this.addUnsignedDeployToQueue(
        deploy,
        sourcePublicKeyHex,
        targetPublicKeyHex
      );
      this.popupManager.openPopup('signDeploy');
      // Await outcome of user interaction with popup.
      this.once(`${deployId}:finished`, (processedDeploy: deployWithID) => {
        if (!this.appState.isUnlocked) {
          return reject(
            new Error(
              `Signer locked during signing process, please unlock and try again.`
            )
          );
        }
        switch (processedDeploy.status) {
          case 'signed':
            if (processedDeploy.deploy) {
              this.appState.unsignedDeploys.clear();
              return resolve(DeployUtil.deployToJson(processedDeploy.deploy));
            }
            this.appState.unsignedDeploys.remove(processedDeploy);
            return reject(new Error(processedDeploy.error?.message));
          case 'failed':
            this.unsignedDeploys = this.unsignedDeploys.filter(
              d => d.id !== processedDeploy.id
            );
            return reject(
              new Error(
                processedDeploy.error?.message! ?? 'User Cancelled Signing'
              )
            );
          default:
            return reject(
              new Error(
                `Signer: Unknown error occurred. Deploy transferDeploy: ${processedDeploy.toString()}`
              )
            );
        }
      });
    });
  }

  /**
   * Sets the status and errors fields for the rejected deploy.
   * @param deployId ID to identify deploy from queue
   */
  public async rejectSignDeploy(deployId: number) {
    const deployWithId = this.getDeployById(deployId);
    deployWithId.status = 'failed';
    deployWithId.error = new Error('User Cancelled Signing');
    this.appState.unsignedDeploys.clear();
    this.saveAndEmitEventIfNeeded(deployWithId);
    await this.popupManager.closePopup();
  }

  // Approve signature request
  public async approveSignDeploy(deployId: number) {
    const deployData = this.getDeployById(deployId);
    if (!this.appState.activeUserAccount) {
      throw new Error(`No Active Account!`);
    }
    let activeKeyPair = this.appState.activeUserAccount.keyPair;
    if (!deployData.deploy) {
      deployData.error = new Error('Cannot sign null deploy!');
      this.saveAndEmitEventIfNeeded(deployData);
      return;
    }

    // Reject if user switches keys during signing process
    if (
      deployData.signingKey &&
      activeKeyPair.publicKey.toHex() !== deployData.signingKey
    ) {
      deployData.status = 'failed';
      deployData.error = new Error('Active key changed during signing');
      this.saveAndEmitEventIfNeeded(deployData);
      return;
    }

    DeployUtil.signDeploy(deployData.deploy, activeKeyPair);

    deployData.status = 'signed';
    this.saveAndEmitEventIfNeeded(deployData);
    await this.popupManager.closePopup();
  }

  /**
   * Get deploy from queue by ID
   * @param deployId
   * @throws Error if there is no deploy with the given ID.
   */
  private getDeployById(deployId: number): deployWithID {
    let deployWithId = this.appState.unsignedDeploys.find(
      transferDeploy => transferDeploy.id === deployId
    );
    if (deployWithId === undefined) {
      throw new Error(`Could not find deploy with id: ${deployId}`);
    }
    return deployWithId;
  }

  private getMessageById(messageId: number): messageWithID {
    const messageWithId = this.appState.unsignedMessages.find(
      msgWithId => msgWithId.id === messageId
    );
    if (!messageWithId)
      throw new Error(`Could not find message with id: ${messageId}`);
    return messageWithId;
  }

  public parseDeployData(deployId: number): DeployData {
    let deployWithID = this.getDeployById(deployId);
    if (deployWithID !== undefined && deployWithID.deploy !== undefined) {
      let header = deployWithID.deploy.header;
      const deployAccount = header.account.toHex();
      // TODO: Handle non-standard payments
      if (!deployWithID.deploy.isStandardPayment())
        throw new Error('Signer does not yet support non-standard payment');

      const payment = deployWithID.deploy.payment.moduleBytes
        ?.getArgByName('amount')!
        .value()
        .toString();

      // TODO: Double-check that this is correct way to determine deploy type.
      const type = deployWithID.deploy.isTransfer()
        ? 'Transfer'
        : deployWithID.deploy.session.isModuleBytes()
        ? 'WASM-Based Deploy'
        : deployWithID.deploy.session.isStoredContractByHash() ||
          deployWithID.deploy.session.isStoredContractByName()
        ? 'Contract Call'
        : // is Stored Versioned Contract
          'Contract Package Call';

      let deployArgs: argDict = {};
      if (deployWithID.deploy.session.transfer) {
        deployArgs = this.parseTransferData(
          deployWithID.deploy.session.transfer,
          deployWithID.targetKey
        );
      } else if (deployWithID.deploy.session.moduleBytes) {
        deployWithID.deploy.session.moduleBytes.args.args.forEach(
          (argument, key) => {
            if (argument.clType() instanceof CLPublicKeyType) {
              deployArgs[key] = (argument as CLPublicKey).toHex();
            } else if (
              argument.clType() instanceof CLByteArrayType ||
              argument.clType() instanceof CLAccountHashType
            ) {
              deployArgs[key] = encodeBase16(argument.value());
            } else {
              // if not a PublicKey or ByteArray
              deployArgs[key] = argument.value().toString();
            }
          }
        );
        deployArgs['Module Bytes'] =
          deployWithID.deploy.session.moduleBytes.moduleBytes.toString();
      } else {
        let storedContract:
          | DeployUtil.StoredContractByHash
          | DeployUtil.StoredContractByName
          | DeployUtil.StoredVersionedContractByHash
          | DeployUtil.StoredVersionedContractByName;
        if (deployWithID.deploy.session.storedContractByHash) {
          storedContract = deployWithID.deploy.session.storedContractByHash;
        } else if (deployWithID.deploy.session.storedContractByName) {
          storedContract = deployWithID.deploy.session.storedContractByName;
        } else if (deployWithID.deploy.session.storedVersionedContractByHash) {
          storedContract =
            deployWithID.deploy.session.storedVersionedContractByHash;
        } else if (deployWithID.deploy.session.storedVersionedContractByName) {
          storedContract =
            deployWithID.deploy.session.storedVersionedContractByName;
        } else {
          throw new Error(`Stored Contract could not be parsed.\n\
          Provided session code: ${deployWithID.deploy.session}`);
        }
        try {
          // Credit to Killian Hascoët (@KillianH on GH) for inspiring this initial implementation for arg parsing.
          storedContract.args.args.forEach((argument, key) => {
            if (argument.clType() instanceof CLPublicKeyType) {
              deployArgs[key] = (argument as CLPublicKey).toHex();
            } else if (
              argument.clType() instanceof CLByteArrayType ||
              argument.clType() instanceof CLAccountHashType
            ) {
              deployArgs[key] = encodeBase16(argument.value());
            } else {
              // if not a PublicKey or ByteArray
              deployArgs[key] = argument.value().toString();
            }
          });
          deployArgs['Entry Point'] = storedContract.entryPoint;
        } catch (err) {
          throw err;
        }
      }
      return {
        deployHash: encodeBase16(deployWithID.deploy.hash),
        signingKey: deployWithID.signingKey,
        account: deployAccount,
        bodyHash: encodeBase16(header.bodyHash),
        chainName: header.chainName,
        timestamp: new Date(header.timestamp).toLocaleString(),
        gasPrice: header.gasPrice,
        payment: payment,
        deployType: type,
        deployArgs: deployArgs
      };
    } else {
      throw new Error('Invalid Deploy');
    }
  }

  /**
   * Sign a message.
   * @param message The string message to be signed.
   * @param signingPublicKey The key for signing (in hex format).
   * @returns `Base16` encoded signature.
   */
  public signMessage(message: string, signingPublicKey: string) {
    return new Promise<string>((resolve, reject) => {
      // TODO: Need to abstract it to reusable method
      const { currentTab, connectedSites } = this.appState;
      const connected =
        currentTab &&
        connectedSites.some(
          site => site.url === currentTab.url && site.isConnected
        );
      if (!connected) return reject('This site is not connected');

      if (!message || !signingPublicKey)
        throw new Error('Message or public key was null/undefined');

      let activeKeyPair = this.appState.activeUserAccount?.keyPair;
      if (!activeKeyPair) throw new Error('No active account');
      if (
        this.appState.userAccounts.some(
          account => account.keyPair.publicKey.toHex() === signingPublicKey
        )
      ) {
        // The provided key matches one of the keys in the vault.
        if (activeKeyPair.publicKey.toHex() !== signingPublicKey) {
          // But it is not set as the Active Key and therefore the signing is cancelled.
          throw new Error(
            'Provided key is not set as Active Key - please set it and try again.'
          );
        }
      } else {
        // The provided key didn't match any of the keys in the vault.
        throw new Error('Provided key is not present in vault.');
      }

      const messageId = this.createId();
      let messageBytes;
      try {
        messageBytes = formatMessageWithHeaders(message);
      } catch (err) {
        throw new Error('Could not format message: ' + err);
      }
      try {
        this.unsignedMessages.push({
          id: messageId,
          messageBytes: messageBytes,
          messageString: message,
          signingKey: signingPublicKey,
          status: 'unsigned'
        });
      } catch (err) {
        throw err;
      }

      this.updateAppState();
      this.popupManager.openPopup('signMessage');
      this.once(`${messageId}:finished`, (processedMessage: messageWithID) => {
        if (!this.appState.isUnlocked) {
          return reject(
            new Error(
              `Signer locked during signing process, please unlock and try again.`
            )
          );
        }
        switch (processedMessage.status) {
          case 'signed': {
            if (processedMessage.messageBytes) {
              this.appState.unsignedMessages.remove(processedMessage);
              if (activeKeyPair !== this.appState.activeUserAccount?.keyPair)
                throw new Error('Active account changed during signing.');
              if (!activeKeyPair)
                throw new Error('No Active Key set - set it and try again.');
              const signature = signFormattedMessage(
                activeKeyPair,
                processedMessage.messageBytes
              );
              return resolve(encodeBase16(signature));
            } else {
              this.appState.unsignedMessages.remove(processedMessage);
              return reject(new Error(processedMessage.error?.message));
            }
          }
          case 'failed': {
            this.unsignedMessages = this.unsignedMessages.filter(
              d => d.id !== processedMessage.id
            );
            return reject(
              new Error(
                processedMessage.error?.message! ?? 'User Cancelled Signing'
              )
            );
          }
          default: {
            return reject(new Error(`Signer: Unknown error occurred`));
          }
        }
      });
    });
  }

  public async approveSigningMessage(messageId: number) {
    const messageWithId = this.getMessageById(messageId);
    if (!this.appState.activeUserAccount) {
      throw new Error(`No Active Account!`);
    }
    let activeKeyPair = this.appState.activeUserAccount.keyPair;
    if (!messageWithId.messageBytes || !messageWithId.messageString) {
      messageWithId.error = new Error(
        `Cannot sign message: ${
          !messageWithId.messageBytes
            ? 'message bytes were null'
            : !messageWithId.messageString
            ? 'message string was null'
            : ''
        }`
      );
      this.saveAndEmitEventIfNeeded(messageWithId);
      return;
    }

    // Reject if user switches keys during signing process
    if (
      messageWithId.signingKey &&
      activeKeyPair.publicKey.toHex() !== messageWithId.signingKey
    ) {
      messageWithId.status = 'failed';
      messageWithId.error = new Error('Active key changed during signing');
      this.saveAndEmitEventIfNeeded(messageWithId);
      return;
    }

    messageWithId.signature = signFormattedMessage(
      activeKeyPair,
      messageWithId.messageBytes
    );

    messageWithId.status = 'signed';
    this.saveAndEmitEventIfNeeded(messageWithId);
    await this.popupManager.closePopup();
  }

  public async cancelSigningMessage(messageId: number) {
    const messageWithId = this.getMessageById(messageId);
    messageWithId.status = 'failed';
    messageWithId.error = new Error('User Cancelled Signing');
    this.appState.unsignedMessages.remove(messageWithId);
    this.saveAndEmitEventIfNeeded(messageWithId);
    await this.popupManager.closePopup();
  }

  private verifyTargetAccountMatch(
    publicKeyHex: string,
    targetAccountHash: string
  ) {
    const providedTargetKeyHash = encodeBase16(
      CLPublicKey.fromHex(publicKeyHex).toAccountHash()
    );

    if (providedTargetKeyHash !== targetAccountHash) {
      throw new Error(
        "Provided target public key doesn't match the one in deploy"
      );
    }
  }

  private parseTransferData(
    transferDeploy: DeployUtil.Transfer,
    providedPublicKeyHex: string
  ) {
    const transferArgs: argDict = {};

    const targetByteArray = transferDeploy?.getArgByName('target')!.value();
    const target = encodeBase16(targetByteArray);

    // Confirm hash of provided public key matches target account hash from deploy
    this.verifyTargetAccountMatch(providedPublicKeyHex, target);

    const recipient = providedPublicKeyHex;
    const amount = transferDeploy?.getArgByName('amount')!.value().toString();
    const id = transferDeploy
      ?.getArgByName('id')!
      .value()
      .unwrap()
      .value()
      .toString();

    transferArgs['Recipient (Hash)'] = target;
    transferArgs['Recipient (Key)'] = recipient;
    transferArgs['Amount'] = amount;
    transferArgs['Transfer ID'] = id;

    return transferArgs;
  }

  private saveAndEmitEventIfNeeded(itemWithId: deployWithID | messageWithID) {
    let status = itemWithId.status;
    const isDeployWithId = (
      object: deployWithID | messageWithID
    ): object is deployWithID => {
      return (object as deployWithID).deploy !== undefined;
    };
    const isMessageWithId = (
      object: deployWithID | messageWithID
    ): object is messageWithID => {
      return (object as messageWithID).messageBytes !== undefined;
    };

    if (isDeployWithId(itemWithId)) {
      this.updateDeployWithId(itemWithId);
    } else if (isMessageWithId(itemWithId)) {
      this.updateMessageWithId(itemWithId);
    }
    if (status === 'failed' || status === 'signed') {
      // fire finished event, so that the Promise can resolve and return result to RPC caller
      this.emit(`${itemWithId.id}:finished`, itemWithId);
    }
  }

  private updateDeployWithId(deployWithId: deployWithID) {
    const index = this.unsignedDeploys.findIndex(
      deployData => deployData.id === deployWithId.id
    );
    if (index === -1) {
      throw new Error(
        `Could not find deploy in queue with id: ${deployWithId.id}`
      );
    }
    this.unsignedDeploys[index] = deployWithId;
    this.updateAppState();
  }

  private updateMessageWithId(messageWithId: messageWithID) {
    const index = this.unsignedMessages.findIndex(
      messageData => messageData.id === messageWithId.id
    );
    if (index === -1) {
      throw new Error(
        `Could not find message in queue with id: ${messageWithId.id}`
      );
    }
    this.unsignedMessages[index] = messageWithId;
    this.updateAppState();
  }
}
