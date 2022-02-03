import React from 'react';
import { Button } from '@material-ui/core';

interface ActionsProps {
  closeHandler: () => void;
}

export function Actions({ closeHandler }: ActionsProps): JSX.Element {
  return (
    <div>
      <Button onClick={closeHandler}>I have backed up all my accounts</Button>
    </div>
  );
}
