import React from 'react';

import { Header } from './Header';
import { Content } from './Content';
import { Actions } from './Actions';

import AccountManager from '../../../container/AccountManager';

interface CreatePromptSubComponents {
  Header: React.FC;
  Content: React.FC;
  Actions: React.FC;
}

interface CreateSubComponents {
  isInitialPageShown: boolean;
  setIsInitialPageShown: (value: boolean) => void;
  authContainer: AccountManager;
  closeHandler: () => Promise<void>;
}

export function createPromptSubComponents({
  isInitialPageShown,
  setIsInitialPageShown,
  authContainer,
  closeHandler
}: CreateSubComponents): CreatePromptSubComponents {
  return {
    Header: () => <Header isOnInitialScreen={isInitialPageShown} />,
    Content: () => (
      <Content
        authContainer={authContainer}
        isInitialPageShown={isInitialPageShown}
        setIsInitialPageShown={setIsInitialPageShown}
      />
    ),
    Actions: () => (
      <Actions
        closeHandler={() => {
          closeHandler().then(() => setIsInitialPageShown(true));
        }}
        isInitialPageShown={isInitialPageShown}
        goBackHandler={() => setIsInitialPageShown(true)}
      />
    )
  };
}
