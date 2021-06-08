import React from 'react';
import mockAuth from '@cognite/auth-utils/jest-mocks';

import { StyledContentWrapper } from '../CardContainer/elements';
import LoginWithAzure from './LoginWithAzure';

export default {
  title: 'Authentication/Azure',
};

const props = {
  cluster: 'test-cluster',
  authClient: mockAuth,
  decorators: [
    (Story: () => React.ReactElement) => (
      <StyledContentWrapper>
        <Story />
      </StyledContentWrapper>
    ),
  ],
};

export const Base = () => {
  return <LoginWithAzure {...props} />;
};
