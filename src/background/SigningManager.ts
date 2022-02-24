import * as events from 'events';
import { AppState } from '../lib/MemStore';
import PopupManager from './PopupManager';
import {
  DeployUtil,
  encodeBase16,
  CLPublicKey,
  formatMessageWithHeaders,
  signFormattedMessage,
  CLTypeTag,
  CLValue,
  CLKey,
  CLURef,
  CLByteArray,
  CLAccountHash,
  CLList,
  CLOption,
  CLResult,
  CLType,
  CLMap,
  CLTuple1,
  CLTuple2,
  CLTuple3
} from 'casper-js-sdk';
import { JsonTypes } from 'typedjson';
import { PurposeForOpening } from '../shared';

type ArgDict = { [key: string]: string | string[] };

export interface messageWithID {
  id: number;
  messageBytes: Uint8Array;
  messageString: string;
  signingKey: string;
  signature?: Uint8Array;
  status: SigningStatus;
  error?: Error;
  pushed?: boolean;
}

export interface deployWithID {
  id: number;
  status: SigningStatus;
  deploy: DeployUtil.Deploy | undefined;
  signingKey: string;
  targetKey?: string;
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
  gasPrice: string;
  payment: string;
  deployArgs: ArgDict;
}

enum SigningStatus {
  unsigned = 'Unsigned',
  signed = 'Signed',
  failed = 'Failed'
}

export default class SigningManager extends events.EventEmitter {
  private unsignedDeploys: deployWithID[];
  private unsignedMessages: messageWithID[];
  private nextId: number;
  private messagePrefix: string = `casper-signer`;
  private messageSuffix: string = `finished`;

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
    signingPublicKeyHex: string,
    targetPublicKeyHex?: string
  ): number {
    const id: number = this.createId();
    try {
      let innerDeploy = DeployUtil.deployFromJson(deployJson);
      if (innerDeploy.ok) {
        this.unsignedDeploys.push({
          id: id,
          status: SigningStatus.unsigned,
          // Should be safe to unwrap here since Result was ok
          deploy: innerDeploy.unwrap(),
          signingKey: signingPublicKeyHex,
          targetKey: targetPublicKeyHex
        });
      } else {
        innerDeploy.mapErr(err => {
          throw new Error(err.message);
        });
      }
    } catch (err) {
      throw err;
    }
    return id;
  }

  /**
   * Signs unsigned deploys from the app's queue
   * @param {any} deploy JSON representation of a deploy - can be constructed using the `DeployUtil.deployToJSON()` method.
   * @param {string} signingPublicKeyHex the hex-formatted public key that corresponds to the secret key you'd like to use for signing.
   * @param {string} targetPublicKeyHex include this if you want the Signer to verify it against an account hash in the deploy.
   * @returns {DeployJson} Signed JSON representation of the given deploy.
   */
  public signDeploy(
    deploy: { deploy: JsonTypes },
    signingPublicKeyHex: string,
    targetPublicKeyHex?: string
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
        signingPublicKeyHex,
        targetPublicKeyHex
      );

      this.updateAppState();
      this.popupManager.openPopup(PurposeForOpening.SignDeploy, deployId);
      // Await outcome of user interaction with popup.
      this.once(
        `${this.messagePrefix}:${deployId}:${this.messageSuffix}`,
        (processedDeploy: deployWithID) => {
          if (!this.appState.isUnlocked) {
            return reject(
              new Error(
                `Signer locked during signing process, please unlock and try again.`
              )
            );
          }
          switch (processedDeploy.status) {
            case SigningStatus.signed:
              if (processedDeploy.deploy) {
                this.appState.unsignedDeploys.clear();
                return resolve(DeployUtil.deployToJson(processedDeploy.deploy));
              }
              this.appState.unsignedDeploys.remove(processedDeploy);
              return reject(new Error(processedDeploy.error?.message));
            case SigningStatus.failed:
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
        }
      );
    });
  }

  /**
   * Sets the status and errors fields for the rejected deploy.
   * @param deployId ID to identify deploy from queue
   */
  public async rejectSignDeploy(deployId: number) {
    const deployWithId = this.getDeployById(deployId);
    deployWithId.status = SigningStatus.failed;
    deployWithId.error = new Error('User Cancelled Signing');
    this.appState.unsignedDeploys.remove(deployWithId);
    this.saveAndEmitEventIfNeeded(deployWithId);
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
      deployData.status = SigningStatus.failed;
      deployData.error = new Error('Active key changed during signing');
      this.saveAndEmitEventIfNeeded(deployData);
      return;
    }

    DeployUtil.signDeploy(deployData.deploy, activeKeyPair);

    deployData.status = SigningStatus.signed;
    this.saveAndEmitEventIfNeeded(deployData);
    this.updateAppState();
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

      let deployArgs: ArgDict = {};
      if (deployWithID.deploy.session.transfer) {
        deployArgs = this.parseTransferData(
          deployWithID.deploy.session.transfer,
          deployWithID.targetKey
        );
      } else if (deployWithID.deploy.session.moduleBytes) {
        deployWithID.deploy.session.moduleBytes.args.args.forEach(
          (argument, key) => {
            deployArgs[key] = this.parseDeployArg(argument);
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
            deployArgs[key] = this.parseDeployArg(argument);
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
        gasPrice: header.gasPrice.toString(),
        payment: payment,
        deployType: type,
        deployArgs: deployArgs
      };
    } else {
      throw new Error('Invalid Deploy');
    }
  }

  private parseDeployArg(arg: CLValue): string | string[] {
    if (!(arg instanceof CLValue)) {
      throw new Error('Argument should be a CLValue, received: ' + typeof arg);
    }
    const tag = arg.clType().tag;
    switch (tag) {
      case CLTypeTag.Unit:
        return String('CLValue Unit');

      case CLTypeTag.Key:
        const key = arg as CLKey;
        if (key.isAccount()) {
          return this.parseDeployArg(key.value() as CLAccountHash);
        }
        if (key.isURef()) {
          return this.parseDeployArg(key.value() as CLURef);
        }
        if (key.isHash()) {
          return this.parseDeployArg(key.value() as CLByteArray);
        }
        throw new Error('Failed to parse key argument');

      case CLTypeTag.URef:
        return (arg as CLURef).toFormattedStr();

      case CLTypeTag.Option:
        const option = arg as CLOption<CLValue>;
        if (option.isSome()) {
          return this.parseDeployArg(option.value().unwrap());
        } else {
          // This will be None due to the above logic
          const optionValue = option.value().toString();
          // This will be the inner CLType of the CLOption e.g. '(bool)'
          const optionCLType = option.clType().toString().split(' ')[1];
          // The format ends up looking like `None (bool)`
          return `${optionValue} ${optionCLType}`;
        }

      case CLTypeTag.List:
        const list = (arg as CLList<CLValue>).value();
        const parsedList = list.map(member => {
          return this.sanitiseNestedLists(member);
        });
        return parsedList;

      case CLTypeTag.ByteArray:
        const bytes = (arg as CLByteArray).value();
        return this.parseBytesToString(bytes);

      case CLTypeTag.Result:
        const result = arg as CLResult<CLType, CLType>;
        const status = result.isOk() ? 'OK:' : 'ERR:';
        const parsed = this.parseDeployArg(result.value().val);
        return `${status} ${parsed}`;

      case CLTypeTag.Map:
        const map = arg as CLMap<CLValue, CLValue>;
        return map.value().toString();

      case CLTypeTag.Tuple1:
        const tupleOne = arg as CLTuple1;
        return this.parseDeployArg(tupleOne.value()[0]);

      case CLTypeTag.Tuple2:
        const tupleTwo = arg as CLTuple2;
        const parsedTupleTwo = tupleTwo.value().map(member => {
          return this.sanitiseNestedLists(member);
        });
        return parsedTupleTwo;

      case CLTypeTag.Tuple3:
        const tupleThree = arg as CLTuple3;
        const parsedTupleThree = tupleThree.value().map(member => {
          return this.sanitiseNestedLists(member);
        });
        return parsedTupleThree;

      case CLTypeTag.PublicKey:
        return (arg as CLPublicKey).toHex();

      default:
        // Special handling as there is no CLTypeTag for CLAccountHash
        if (arg instanceof CLAccountHash)
          return this.parseBytesToString(arg.value());
        return arg.value().toString();
    }
  }

  /**
   * This implementation allows for catching lists of lists.
   * The UI isn't set up for handling nested lists.
   *
   * @param value The CLValue that could possibly be a CLList.
   * @returns The stringified CLValue, if it is a CLList it will return '<vectorType>[...]'
   */
  private sanitiseNestedLists(value: CLValue): string {
    const parsedValue = this.parseDeployArg(value);
    if (Array.isArray(parsedValue)) {
      const parsedType = (value as CLList<CLValue>).vectorType;
      return `<${parsedType}>[...]`;
    }
    return parsedValue;
  }

  /**
   * Byte arrays cannot be displayed on the FE without converting them to strings.
   * We hex encode them for this reason.
   */
  private parseBytesToString(bytes: Uint8Array): string {
    return encodeBase16(bytes);
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
      // If the Signer is locked then the account data is unavailable to perform these checks
      // resulting in them always throwing the errors.
      // We can check the key matches once the Signer opens and is unlocked.
      if (this.appState.isUnlocked) {
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
          status: SigningStatus.unsigned
        });
      } catch (err) {
        throw err;
      }

      this.updateAppState();
      this.popupManager.openPopup(PurposeForOpening.SignMessage, messageId);
      this.once(
        `${this.messagePrefix}:${messageId}:${this.messageSuffix}`,
        (processedMessage: messageWithID) => {
          if (!this.appState.isUnlocked) {
            return reject(
              new Error(
                `Signer locked during signing process, please unlock and try again.`
              )
            );
          }
          switch (processedMessage.status) {
            case SigningStatus.signed:
              if (processedMessage.messageBytes) {
                this.appState.unsignedMessages.remove(processedMessage);
                if (!activeKeyPair)
                  return reject(
                    new Error('No Active Key set - set it and try again.')
                  );

                // Check if the provided key matches the active key stored in Signer
                if (
                  signingPublicKey !==
                  this.appState.activeUserAccount?.keyPair.accountHex()
                )
                  return reject(
                    new Error(
                      'Active account key does not match provided signing key'
                    )
                  );

                // If the request was made when the Signer was locked then the activeKeyPair will be null
                // so we need to run this check only if the keypair was retrieved i.e. if the Signer was unlocked.
                if (activeKeyPair) {
                  // Check if the active key is the same now as it was when the request was initiated
                  // Needs to be stringified as they are not the same object we're just checking their values match
                  if (
                    JSON.stringify(activeKeyPair) !==
                    JSON.stringify(this.appState.activeUserAccount?.keyPair)
                  )
                    return reject(
                      new Error('Active account changed during signing.')
                    );
                }
                const signature = signFormattedMessage(
                  activeKeyPair,
                  processedMessage.messageBytes
                );
                return resolve(encodeBase16(signature));
              } else {
                this.appState.unsignedMessages.remove(processedMessage);
                return reject(new Error(processedMessage.error?.message));
              }
            case SigningStatus.failed:
              this.unsignedMessages = this.unsignedMessages.filter(
                d => d.id !== processedMessage.id
              );
              return reject(
                new Error(
                  processedMessage.error?.message! ?? 'User Cancelled Signing'
                )
              );
            default:
              return reject(new Error(`Signer: Unknown error occurred`));
          }
        }
      );
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
      messageWithId.status = SigningStatus.failed;
      messageWithId.error = new Error('Active key changed during signing');
      this.saveAndEmitEventIfNeeded(messageWithId);
      return;
    }

    messageWithId.signature = signFormattedMessage(
      activeKeyPair,
      messageWithId.messageBytes
    );

    messageWithId.status = SigningStatus.signed;
    this.saveAndEmitEventIfNeeded(messageWithId);
  }

  public async cancelSigningMessage(messageId: number) {
    const messageWithId = this.getMessageById(messageId);
    messageWithId.status = SigningStatus.failed;
    messageWithId.error = new Error('User Cancelled Signing');
    this.appState.unsignedMessages.remove(messageWithId);
    this.saveAndEmitEventIfNeeded(messageWithId);
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
    providedTarget?: string
  ) {
    const transferArgs: ArgDict = {};

    // Target can either be a hex formatted public key or an account hash
    const targetFromDeploy = transferDeploy?.getArgByName('target')!;
    let targetFromDeployHex;

    switch (targetFromDeploy.clType().tag) {
      // If deploy is created using older version of SDK
      // confirm hash of provided public key matches target account hash from deploy
      case CLTypeTag.ByteArray: {
        targetFromDeployHex = encodeBase16(targetFromDeploy.value());
        // Requester has provided a public key to compare against the target in the deploy
        if (providedTarget) {
          let providedTargetLower = providedTarget.toLowerCase();
          this.verifyTargetAccountMatch(
            providedTargetLower,
            targetFromDeployHex
          );
        }
        transferArgs[`Recipient (Hash)`] = targetFromDeployHex;
        break;
      }
      // If deploy is created using version of SDK gte than 2.7.0
      // In fact this logic can be removed in future as well as pkHex param
      case CLTypeTag.PublicKey: {
        targetFromDeployHex = (targetFromDeploy as CLPublicKey).toHex();
        // Requester has provided a public key to compare against the target in the deploy
        if (providedTarget) {
          if (targetFromDeployHex !== providedTarget) {
            throw new Error(
              "Provided target public key doesn't match the one in the deploy"
            );
          }
        }
        transferArgs['Recipient (Key)'] = targetFromDeployHex;
        break;
      }
      default: {
        throw new Error(
          'Target from deploy was neither AccountHash or PublicKey'
        );
      }
    }

    const amount = transferDeploy?.getArgByName('amount')!.value().toString();
    const id = transferDeploy
      ?.getArgByName('id')!
      .value()
      .unwrap()
      .value()
      .toString();

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
    if (status === SigningStatus.failed || status === SigningStatus.signed) {
      // fire finished event, so that the Promise can resolve and return result to RPC caller
      this.emit(
        `${this.messagePrefix}:${itemWithId.id}:${this.messageSuffix}`,
        itemWithId
      );
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
