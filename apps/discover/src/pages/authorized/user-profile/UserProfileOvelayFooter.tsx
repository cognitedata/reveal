import * as React from 'react';

import { Version } from '@cognite/react-version';

import { UserProfileFooterContainer } from './elements';

export const UserProfileOverlayFooter: React.FC = () => {
  return (
    <UserProfileFooterContainer>
      <Version />
    </UserProfileFooterContainer>
  );
};
