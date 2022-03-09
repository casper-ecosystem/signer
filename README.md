# Casper Signer

The Casper Signer is a browser plugin used to sign transactions for the Casper Network.

You can find the latest version on the [Chrome Web Store](https://chrome.google.com/webstore/detail/casperlabs-signer/djhndpllfiibmcdbnmaaahkhchcoijce). For help and usage tips, check out the [Casper Signer User Guide](https://casper.network/docs/workflow/signer-guide).

**Note:** The Casper Signer supports Google Chrome and Chromium-based browsers like Brave. We recommend using the latest available browser versions.

## Integrating with the Casper Signer

To integrate your website with the Casper Signer on Mainnet, you need to go through an [approval process](https://github.com/casper-ecosystem/signer/wiki/Casper-Signer-Whitelisting-Request-Guide).

## Architecture 

The Casper Signer browser extension has four components outlined here.

### 1. User Interface

The directory `src/popup` contains the web extension's user interface (UI), written in React. Since we do not store state information when the user closes the Signer window, we need to use the background script in the next step, which acts as a server. 

To synchronize and modify its state, the UI calls the background script via RPC, sending an update request. Thus, the UI will refresh.

### 2. Background Script

The second component is a script that works in the background as a back-end server, providing RPC methods for updating the UI. The related source code is in `src/background`.

### 3. Content Script

A content script is also part of the Casper Signer extension and runs in the context of a particular webpage. You can specify which web page can run the content script by adding a rule in `manifest.json/content_scripts`. 

When a web page is integrated with the Signer, such as the [CSPR.live](https://cspr.live/) block explorer; the web extension creates a new *ContentScript* in the web page context. You will find the source code in `src/content/contentscript.ts`. 

Thus you need to set up the content script for each page in question and call in the inject script, `inject.ts`, into the DOM before anything loads. Then, the content script sets up a proxy to receive requests from the injected script and forward them to the background script.

### 4. Inject Script

The fourth component is the inject script, `inject.ts`, which runs inside the context of the web page integrated with the Casper Signer. Remember from the previous step that the content script calls the inject script, which creates a global instance of the `CasperLabsPluginHelper`, and the web page can call `window.casperlabsHelper`.

## Developing Locally

Here we provide some helpful commands for building and running the Casper Signer.

### Prerequisites

First, you need to install `npm`, which will help you set up all the dependencies.

```bash

npm install

```

### Building the Casper Signer

The next command builds the Casper Signer and outputs the bundle files to the `build` directory. This command will also help you rebuild the code of the user interface; however, you need to reopen or refresh the Singer pop-up window to see the changes take effect.

```bash

npm run watch

```

### Running the Scripts

The following command builds the background, content, and inject scrips in *watch* mode. When using this command, you have to reload the extension on Chrome's extension manager page.

```bash

npm run scripts_watch

```

### Building and Publishing

To build and publish your changes, run the following command. You will find the built package in the `artifacts` directory.

```bash

npm run complete

```

