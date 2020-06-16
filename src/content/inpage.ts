import { registerClient } from '../lib/rpc/client';

// See README.md for details
class CasperLabsPluginHelper {
  private readonly call: <RESULT>(
    method: string,
    ...params: any[]
  ) => Promise<RESULT>;

  constructor() {
    this.call = registerClient();
  }

  isConnected() {
    return true;
  }

  async sign(message: String) {
    return this.call<string>('sign', message);
  }

  async getSelectedPublicKeyBase64() {
    return this.call<string>('getSelectedPublicKeyBase64');
  }
}

// inject to window, so that Clarity code could use it.
(window as any).casperlabsHelper = new CasperLabsPluginHelper();
