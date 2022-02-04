import React from 'react';
import { DialogTitle } from '@material-ui/core';

interface Props {
  isOnInitialScreen: boolean;
}

export function Header({ isOnInitialScreen }: Props): JSX.Element {
  if (!isOnInitialScreen) {
    return <></>;
  }

  return <DialogTitle>Protect your funds</DialogTitle>;
}
