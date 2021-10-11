import React from 'react';

import { NoUnmountShowHideContainer } from './elements';

export interface NoUnmountShowHideProps {
  show: boolean;
}

export const NoUnmountShowHide: React.FC<NoUnmountShowHideProps> = React.memo(
  ({ show, children }) => {
    return (
      <NoUnmountShowHideContainer show={show}>
        {children}
      </NoUnmountShowHideContainer>
    );
  }
);
