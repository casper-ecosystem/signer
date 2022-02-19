import { HeaderPageOne, HeaderPageTwo } from './components/Header';
import { ContentPageOne, ContentPageTwo } from './components/Content';
import { ActionsPageOne, ActionsPageTwo } from './components/Actions';

import AccountManager from '../../../container/AccountManager';

interface Props {
  promptPageIndex: number;
  setPromptPageIndex: (page: number) => void;
  authContainer: AccountManager;
  closeHandler: () => Promise<void>;
}

export function createSecurityCheckupContents({
  promptPageIndex,
  setPromptPageIndex,
  authContainer,
  closeHandler
}: Props) {
  switch (promptPageIndex) {
    case 0:
      return {
        Header: <HeaderPageOne />,
        Content: ContentPageOne,
        Actions: ActionsPageOne
      };
    case 1:
      return {
        Header: null,
        Content: null,
        Actions: null
      };
    default:
      return {
        Header: null,
        Content: null,
        Actions: null
      };
  }
  return {
    Header: [HeaderPageOne, HeaderPageTwo],
    Content: [ContentPageOne, ContentPageTwo],
    Actions: [ActionsPageOne, ActionsPageTwo]
  };
}
