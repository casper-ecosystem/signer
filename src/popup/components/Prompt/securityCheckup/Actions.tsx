import React from 'react';
import { Button } from '@material-ui/core';

interface Props {
  closeHandler: () => void;
  goBackHandler: () => void;
  isInitialPageShown: boolean;
}

export function Actions({
  closeHandler,
  goBackHandler,
  isInitialPageShown
}: Props): JSX.Element {
  if (!isInitialPageShown) {
    return (
      <div className="prompt-back-button">
        <Button fullWidth onClick={goBackHandler}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="prompt-close-button">
      <Button fullWidth onClick={closeHandler}>
        I have backed up all my accounts
      </Button>
    </div>
  );
}
