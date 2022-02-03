import React from 'react';
import { Dialog } from '@material-ui/core';

interface PromptProps {
  isOpened: boolean;
  Header: React.FC;
  Content: React.FC;
  Actions: React.FC;
}

export function Prompt({
  isOpened,
  Header,
  Content,
  Actions
}: PromptProps): JSX.Element {
  return (
    <Dialog open={isOpened}>
      <div className="prompt-container">
        <Header />
        <Content />
        <Actions />
      </div>
    </Dialog>
  );
}
