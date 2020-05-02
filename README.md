# signer
Browser plugin used to sign transations

## Architecture 

There are four roles in the browser extension.

### 1. Popup

The directory `src/popup` contains the UI part of WebExtension, which is written in React. Since all states lose when the user closes the WebExtension, we need to use the background script as a server. 

#### State Synchronization

Popup call RPC method to background script to modify state, then background scripts push its updated state to popup.

### 2. Background script

Background work as a backend server, it provides RPC methods for injecting page and popup. The related source code is in `src/background`.

### 3. Content Script

A content script is a part of your extension that runs in the context of a particular web page. You can specify which webpage can run the content script by specifying rule in `manifest.json/content_scripts`. 

The code is in `src/content/contentscript.ts`. When Clarity is visited, the WebExtension creates a new ContentScript in Clarity's page context. This script represents a per-page setup process, which injects `inject.ts` into the DOM before anything loads.  And then content script sets up a Proxy, it receives requests from the injected script and forwards it to background script.

### 4. Inject Script

Inject script run inside the context of Clarity, which is injected by content script. It just creates a global instance of `CasperLabsPluginHelper`, so that Clarity code could use it by `window.casperlabsHelper`.

## Develop locally

To build the client and the server you'll need npm.

Here we provide some useful npm command for developing.

### `npm install`
It will install all dependencies for you.

### `npm run watch`

It will build Popup and output bundle files to `build` directory, and it will also rebuild every time when you modified the code of Popup, however, you still need to reopen or refresh the Popup.

### `npm run scripts_watch`

It will build background, content, and inject scrips in watch mode. However, you have to reload the extension in Chrome's Extension Manage Page.

## Build & Publish

Run `npm run complete`, and then you can find a built browser extension in `artifacts` directory.
