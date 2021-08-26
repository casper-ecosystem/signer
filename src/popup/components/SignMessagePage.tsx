import SigningContainer from '../container/SigningContainer';
import React from 'react';
import { Redirect } from 'react-router-dom';
import Pages from './Pages';
import { browser } from 'webextension-polyfill-ts';
import { Button, withStyles } from '@material-ui/core';

const ApproveButton = withStyles(() => ({
  root: {
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'rgba(11, 156, 49, 0.6)'
    }
  }
}))(Button);

const CancelButton = withStyles(() => ({
  root: {
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'rgba(255, 0, 0, 0.6)'
    }
  }
}))(Button);

export const SignMessagePage = (signingContainer: SigningContainer) => {
  const messageWithID = signingContainer.messageToSign;
  browser.windows.getCurrent().then(w => {
    if (w.type === 'popup' && messageWithID?.id) {
      window.addEventListener('beforeunload', e => {
        signingContainer.messageToSign &&
          signingContainer.cancelSigningMessage(messageWithID.id);
      });
    }
  });

  if (messageWithID) {
    return (
      <div>
        <h2>Do you want to sign the message?</h2>
        <br />
        <b>
          <code>Casper Message:</code>
        </b>
        <div
          style={{
            padding: '.5rem',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '15px'
          }}
        >
          <p>{messageWithID.messageString}</p>
        </div>
        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            justifyContent: 'space-evenly'
          }}
        >
          <ApproveButton
            variant="outlined"
            onClick={() =>
              signingContainer
                .approveSigningMessage(messageWithID.id)
                .then(() => {
                  window.close();
                })
            }
          >
            Approve
          </ApproveButton>
          <CancelButton
            variant="outlined"
            onClick={() =>
              signingContainer.cancelSigningMessage(messageWithID.id)
            }
          >
            Cancel
          </CancelButton>
        </div>
      </div>
    );
  } else {
    return <Redirect to={Pages.Home} />;
  }
};
