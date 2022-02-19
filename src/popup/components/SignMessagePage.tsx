import SigningContainer from '../container/SigningContainer';
import React from 'react';
import { Redirect } from 'react-router-dom';
import Pages from './Pages';
import { browser } from 'webextension-polyfill-ts';
import { Button, withStyles } from '@material-ui/core';
import { truncateString } from '../../shared';
import PopupContainer from '../container/PopupContainer';

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

export const SignMessagePage = (
  signingContainer: SigningContainer,
  popupContainer: PopupContainer
) => {
  const messageWithID = signingContainer.messageToSign; // useState(signingContainer.messageToSign);
  browser.windows.getCurrent().then(w => {
    if (w.type === 'popup' && messageWithID?.id) {
      window.addEventListener('beforeunload', e => {
        signingContainer.messageToSign &&
          signingContainer.cancelSigningMessage(messageWithID.id);
      });
    }
  });

  // console.log(messageWithID);
  return messageWithID ? (
    <div>
      <h2>Do you want to sign the message?</h2>
      <br />
      <b>
        <code>Casper Message:</code>
      </b>
      <div
        style={{
          padding: '.1rem .5rem',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '10px',
          fontSize: '1rem'
        }}
      >
        <p>{messageWithID.messageString}</p>
      </div>
      <br />
      <b>
        <code>Signing Key:</code>
      </b>
      <div
        style={{
          padding: '.1rem .5rem',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '10px',
          fontSize: '0.9rem'
        }}
      >
        <p>{truncateString(messageWithID.signingKey, 15, 15)}</p>
      </div>
      <div
        style={{
          marginTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-evenly'
        }}
      >
        <ApproveButton
          variant="outlined"
          onClick={() =>
            signingContainer
              .approveSigningMessage(messageWithID.id)
              .then(() => popupContainer.callClosePopup())
          }
        >
          Approve
        </ApproveButton>
        <CancelButton
          variant="outlined"
          onClick={() =>
            signingContainer
              .cancelSigningMessage(messageWithID.id)
              .then(() => popupContainer.callClosePopup())
          }
        >
          Cancel
        </CancelButton>
      </div>
    </div>
  ) : (
    <Redirect to={Pages.Home} />
  );
};
