import React from 'react';
import mockAuth from '@cognite/auth-utils/dist/mocks';

import { StyledContentWrapper } from '../CardContainer/elements';

import LoginWithAzure from './LoginWithAzure';

export default {
  title: 'Authentication/Azure',
};

jest.mock('@cognite/auth-utils', () => {
  const original = jest.requireActual('@cognite/auth-utils');
  return {
    ...original,
    ...mockAuth,
  };
});

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

export const Base = () => <LoginWithAzure {...props} />;
