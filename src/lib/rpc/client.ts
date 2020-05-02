import { Rpc } from './rpc';
import { Request } from './tunnel';

/**
 * RPC client which is used in Inject Script
 *
 * Inject script can't use browser.sendMessage, it can only use window.postMessage,
 * which will not return result.
 *
 * So we need assign each message a unique messageId and PAGE_ID, so that we could
 * find the reply message for each request.
 *
 * @param logMessages
 */
export function registerClient(logMessages = false) {
  // A unique message ID that is used to ensure responses are sent to the correct requests
  let _messageId = 0;
  let generateNewMessageId = () => ++_messageId;
  const PAGE_ID = Math.random() * Number.MAX_SAFE_INTEGER;

  const rpc = new Rpc({
    source: 'page',
    destination: 'background',
    logMessages,
    postMessage: (msg: Request) => {
      return new Promise((resolve, reject) => {
        const msgId = generateNewMessageId();
        // inspired by postmate
        // https://github.com/dollarshaveclub/postmate/blob/master/src/postmate.js#L136
        window.postMessage(
          { type: 'request', pageId: PAGE_ID, msgId, payload: msg },
          '*'
        );

        let transact = (e: MessageEvent) => {
          if (
            e.data.pageId === PAGE_ID &&
            e.data.msgId === msgId &&
            e.data.type === 'reply'
          ) {
            window.removeEventListener('message', transact, false);
            resolve(e.data.value);
          }
        };

        window.addEventListener('message', transact, false);
      });
    }
  });

  return function call<RESULT>(method: string, ...params: any[]) {
    return rpc.call<RESULT>(method, ...params);
  };
}
