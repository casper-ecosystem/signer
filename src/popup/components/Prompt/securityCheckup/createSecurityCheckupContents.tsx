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
  return {
    renderSecurityCheckupHeader: () => {
      switch (securityCheckupPageIndex) {
        case 0:
          return <HeaderPageOne />;
        case 1:
          return <HeaderPageTwo />;
        default:
          return <></>;
      }
    },
    renderSecurityCheckupContent: () => {
      switch (securityCheckupPageIndex) {
        case 0:
          return (
            <ContentPageOne
              setSecurityCheckupPageIndex={setSecurityCheckupPageIndex}
            />
          );
        case 1:
          return <ContentPageTwo accountManager={accountManager} />;
        default:
          return <></>;
      }
    },
    renderSecurityCheckupActions: () => {
      switch (securityCheckupPageIndex) {
        case 0:
          return <ActionsPageOne closeHandler={closeHandler} />;
        case 1:
          return (
            <ActionsPageTwo
              setSecurityCheckupPageIndex={setSecurityCheckupPageIndex}
            />
          );
        default:
          return <></>;
      }
    }
  };
}
