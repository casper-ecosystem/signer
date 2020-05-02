/*
 * https://github.com/ontio/ontology-dapi/blob/master/src/rpc/rpc.ts
 */
import { Caller, Tunnel, TunnelOptions } from './tunnel';

export type MethodType = (...params: any[]) => any;

interface MethodCallType {
  method: string;
  params: any[];
}

export class Rpc {
  private tunnel: Tunnel<MethodCallType>;
  private methods: Map<string, MethodType>;

  constructor(options: TunnelOptions) {
    options.messageHandler = this.messageHandler.bind(this);

    this.tunnel = new Tunnel(options);
    this.methods = new Map();
  }

  call<RESULT = any>(method: string, ...params: any[]) {
    const msg = {
      method,
      params
    };

    return this.tunnel.send<RESULT>(msg);
  }

  register(name: string, method: MethodType) {
    this.methods.set(name, method);
  }

  private messageHandler(msg: MethodCallType, caller: Caller) {
    const method = this.methods.get(msg.method);

    if (method === undefined) {
      throw new Error('Unregistered method call: ' + msg.method);
    }

    return method.call(caller, ...msg.params);
  }
}
