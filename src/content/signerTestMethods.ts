import { registerClient } from '../lib/rpc/client';

/**
 * Provides methods to test the Signer and Clarity together
 * bypassing the Signer's UI. This is implemented in the Cypress
 * tests for Clarity.
 * It will only be available if the Signer is running in dev.
 * And the files will not be included in the build.
 */
class SignerTestingHelper {
  private readonly call: <RESULT>(
    method: string,
    ...params: any[]
  ) => Promise<RESULT>;

  constructor() {
    this.call = registerClient();
  }

  async forceConnection() {
    return this.call<void>('connectToSite');
  }

  async forceDisconnect() {
    return this.call<void>('disconnectFromSite');
  }

  async hasCreatedVault() {
    return this.call<boolean>('hasCreatedVault');
  }

  async resetExistingVault() {
    return this.call<void>('resetExistingVault');
  }

  async createNewVault(password: string) {
    return this.call<void>('createNewVault', password);
  }

  async createTestAccount(name: string, privateKey: string) {
    return this.call<void>('createTestAccount', name, privateKey);
  }

  async getToSignMessageID() {
    return this.call<number>('getToSignMessageID');
  }

  async signTestDeploy(msgId: number) {
    return this.call<void>('signTestDeploy', msgId);
  }
}

// Inject to window object to allow access from Clarity
(window as any).signerTestingHelper = new SignerTestingHelper();
