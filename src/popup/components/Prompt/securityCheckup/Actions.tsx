import React from 'react';
import { Button } from '@material-ui/core';

interface ActionsProps {
  closeHandler: () => void;
  goBackHandler: () => void;
  isInitialPageShown: boolean;
}

export function Actions({
  closeHandler,
  goBackHandler,
  isInitialPageShown
}: ActionsProps): JSX.Element {
  if (!isInitialPageShown) {
    return (
      <div className="prompt-bottom-buttons">
        <Button fullWidth onClick={goBackHandler}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button fullWidth onClick={closeHandler}>
        I have backed up all my accounts
      </Button>
    </div>
  );
}
