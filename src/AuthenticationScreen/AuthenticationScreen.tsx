import React from 'react';
import { Centered } from 'elements';
import { StyledAuthenticationScreen } from './elements';

type Props = {
  children: React.ReactNode;
};

const BackgroundOverlay = ({ children }: Props) => {
  return (
    <StyledAuthenticationScreen>
      <Centered>{children}</Centered>
    </StyledAuthenticationScreen>
  );
};

export default BackgroundOverlay;
