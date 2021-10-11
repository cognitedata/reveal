import React from 'react';

import { TitleContainer } from './elements';

interface Props {
  children: React.ReactNode;
}
export const TitleComponent: React.FC<Props> = ({ children }) => {
  return (
    <TitleContainer level={4} data-testid="title">
      {children}
    </TitleContainer>
  );
};

export default TitleComponent;
