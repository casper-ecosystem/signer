import { browser } from 'webextension-polyfill-ts';
import { registerContentProxy } from '../lib/rpc/Provider';

// See README.MD for details
// Injects a script tag into the current document
function injectCustomJs() {
  try {
    let jsPath = 'scripts/content/inpage.js';
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('type', 'text/javascript');
    scriptTag.src = browser.extension.getURL(jsPath);
    container.insertBefore(scriptTag, container.children[0]);
    scriptTag.onload = function () {
      // remove after run the script
      container.removeChild(scriptTag);
    };
  } catch (e) {
    console.error('CasperLabs provider injection failed.', e);
  }
  try {
    let jsPath = 'scripts/content/signerTestMethods.js';
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('type', 'text/javascript');
    scriptTag.src = browser.extension.getURL(jsPath);
    container.insertBefore(scriptTag, container.children[0]);
    scriptTag.onload = function () {
      // remove after run the script
      container.removeChild(scriptTag);
    };
  } catch (e) {
    console.error('CasperLabs test provider injection failed.', e);
  }
}

injectCustomJs();
// inject page -> content script -> background
registerContentProxy();
