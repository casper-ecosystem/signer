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

export function createSecurityCheckupContents({
  securityCheckupPageIndex,
  setSecurityCheckupPageIndex,
  accountManager,
  closeHandler
}: Props) {
  switch (securityCheckupPageIndex) {
    case 0:
      return {
        securityCheckupHeader: <HeaderPageOne />,
        securityCheckupContent: (
          <ContentPageOne
            setSecurityCheckupPageIndex={setSecurityCheckupPageIndex}
          />
        ),
        securityCheckupActions: <ActionsPageOne closeHandler={closeHandler} />
      };
    case 1:
      return {
        securityCheckupHeader: <HeaderPageTwo />,
        securityCheckupContent: (
          <ContentPageTwo accountManager={accountManager} />
        ),
        securityCheckupActions: (
          <ActionsPageTwo
            setSecurityCheckupPageIndex={setSecurityCheckupPageIndex}
          />
        )
      };
    default:
      return {
        securityCheckupHeader: <HeaderPageOne />,
        securityCheckupContent: (
          <ContentPageOne
            setSecurityCheckupPageIndex={setSecurityCheckupPageIndex}
          />
        ),
        securityCheckupActions: <ActionsPageOne closeHandler={closeHandler} />
      };
  }
}
