import React from 'react';

import { TitleContainer } from './elements';

export const TitleComponent: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  return (
    <TitleContainer level={4} data-testid="title">
      {children}
    </TitleContainer>
  );
};

export default TitleComponent;
