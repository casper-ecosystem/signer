import React from 'react';
import { DialogContent, DialogContentText } from '@material-ui/core';

export function Content(): JSX.Element {
  return (
    <DialogContent>
      <DialogContentText>
        <p>
          Each of your accounts has a corresponding Secret Key file that
          provides access to the funds on that account.
        </p>
        <ul className="prompt-content-list">
          <li>
            Make sure that you have downloaded and backed up each Secret Key
            file. <a href="#">Start here</a>.
          </li>
          <li>Never share your Secret Key file with anyone.</li>
          <li>
            The Casper Signer Team will never ask for your Secret Key file.
          </li>
        </ul>
      </DialogContentText>
    </DialogContent>
  );
}
