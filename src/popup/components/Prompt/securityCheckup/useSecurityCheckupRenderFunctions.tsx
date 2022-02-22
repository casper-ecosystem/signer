import React, { useState } from 'react';

import { HeaderPageOne, HeaderPageTwo } from './components/Header';
import { ContentPageOne, ContentPageTwo } from './components/Content';
import { ActionsPageOne, ActionsPageTwo } from './components/Actions';

import AccountManager from '../../../container/AccountManager';

interface Props {
  accountManager: AccountManager;
  closeHandler: () => Promise<void>;
}

export interface SecurityCheckupRenderFunctions {
  renderHeader(): JSX.Element;
  renderContent(): JSX.Element;
  renderActions(): JSX.Element;
}

export function useSecurityCheckupRenderFunctions({
  accountManager,
  closeHandler
}: Props): SecurityCheckupRenderFunctions {
  const [securityCheckupPageIndex, setSecurityCheckupPageIndex] = useState(0);

  if (securityCheckupPageIndex === 1) {
    return {
      renderHeader: () => <HeaderPageTwo />,
      renderContent: () => <ContentPageTwo accountManager={accountManager} />,
      renderActions: () => (
        <ActionsPageTwo
          setSecurityCheckupPageIndex={setSecurityCheckupPageIndex}
        />
      )
    };
  }

  return {
    renderHeader: () => <HeaderPageOne />,
    renderContent: () => (
      <ContentPageOne
        setSecurityCheckupPageIndex={setSecurityCheckupPageIndex}
      />
    ),
    renderActions: () => <ActionsPageOne closeHandler={closeHandler} />
  };
}
