import React, { PropsWithChildren } from 'react';

import { NoUnmountShowHideContainer } from './elements';

export interface NoUnmountShowHideProps {
  show: boolean;
}

export const NoUnmountShowHide: React.FC<
  PropsWithChildren<NoUnmountShowHideProps>
> = React.memo(({ show, children }) => {
  return (
    <NoUnmountShowHideContainer show={show}>
      {children}
    </NoUnmountShowHideContainer>
  );
});
