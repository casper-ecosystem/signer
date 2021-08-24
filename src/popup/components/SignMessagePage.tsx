import SigningContainer from '../container/SigningContainer';
import React from 'react';
import { Redirect } from 'react-router-dom';
import Pages from './Pages';

export const SignMessagePage = (signingContainer: SigningContainer) => {
  const messageWithID = signingContainer.messageToSign;
  if (messageWithID) {
    return (
      <div>
        Sign Message:
        <br />
        {messageWithID.messageString}
        <br />
        <button>Approve</button>
        <button>Cancel</button>
      </div>
    );
  } else {
    return <Redirect to={Pages.Home} />;
  }
};
