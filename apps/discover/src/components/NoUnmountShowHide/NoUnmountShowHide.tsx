import React, { ReactNode } from 'react';

import { NoUnmountShowHideContainer } from './elements';

export interface NoUnmountShowHideProps {
  show: boolean;
  fullHeight?: boolean;
  children?: ReactNode;
}

export const NoUnmountShowHide: React.FC<NoUnmountShowHideProps> = React.memo(
  ({ show, fullHeight, children }) => {
    return (
      <NoUnmountShowHideContainer show={show} fullHeight={fullHeight}>
        {children}
      </NoUnmountShowHideContainer>
    );
  }
);
