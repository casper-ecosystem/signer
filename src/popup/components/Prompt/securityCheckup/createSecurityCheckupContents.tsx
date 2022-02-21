import React from 'react';

import { HeaderPageOne, HeaderPageTwo } from './components/Header';
import { ContentPageOne, ContentPageTwo } from './components/Content';
import { ActionsPageOne, ActionsPageTwo } from './components/Actions';

import AccountManager from '../../../container/AccountManager';

interface Props {
  securityCheckupPageIndex: number;
  setSecurityCheckupPageIndex: (page: number) => void;
  accountManager: AccountManager;
  closeHandler: () => Promise<void>;
}

export interface SecurityCheckupRenderFunctions {
  renderSecurityCheckupHeader(): JSX.Element;
  renderSecurityCheckupContent(): JSX.Element;
  renderSecurityCheckupActions(): JSX.Element;
}

export function createSecurityCheckupRenderFunctions({
  securityCheckupPageIndex,
  setSecurityCheckupPageIndex,
  accountManager,
  closeHandler
}: Props): SecurityCheckupRenderFunctions {
  if (securityCheckupPageIndex === 0) {
    return {
      renderSecurityCheckupHeader: () => <HeaderPageOne />,
      renderSecurityCheckupContent: () => (
        <ContentPageOne
          setSecurityCheckupPageIndex={setSecurityCheckupPageIndex}
        />
      ),
      renderSecurityCheckupActions: () => (
        <ActionsPageOne closeHandler={closeHandler} />
      )
    };
  }

  if (securityCheckupPageIndex === 1) {
    return {
      renderSecurityCheckupHeader: () => <HeaderPageTwo />,
      renderSecurityCheckupContent: () => (
        <ContentPageTwo accountManager={accountManager} />
      ),
      renderSecurityCheckupActions: () => (
        <ActionsPageTwo
          setSecurityCheckupPageIndex={setSecurityCheckupPageIndex}
        />
      )
    };
  }

  // If `securityCheckupPageIndex` more than 1 or less than 0
  setSecurityCheckupPageIndex(0);

  return {
    renderSecurityCheckupHeader: () => <HeaderPageOne />,
    renderSecurityCheckupContent: () => (
      <ContentPageOne
        setSecurityCheckupPageIndex={setSecurityCheckupPageIndex}
      />
    ),
    renderSecurityCheckupActions: () => (
      <ActionsPageOne closeHandler={closeHandler} />
    )
  };
}
