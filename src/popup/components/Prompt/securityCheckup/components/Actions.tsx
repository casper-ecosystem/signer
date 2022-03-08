import React from 'react';
import { Button } from '@material-ui/core';

interface ActionsPageOneProps {
  closeHandler: () => Promise<void>;
}

export function ActionsPageOne({ closeHandler }: ActionsPageOneProps) {
  return (
    <Button
      variant="contained"
      color="primary"
      fullWidth
      onClick={closeHandler}
    >
      I have backed up all my accounts
    </Button>
  );
}

interface ActionsPageTwoProps {
  setSecurityCheckupPageIndex: (page: number) => void;
}

export function ActionsPageTwo({
  setSecurityCheckupPageIndex
}: ActionsPageTwoProps) {
  return (
    <Button
      variant="contained"
      color="secondary"
      fullWidth
      onClick={() => setSecurityCheckupPageIndex(0)}
    >
      Back
    </Button>
  );
}
