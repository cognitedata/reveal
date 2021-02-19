import React from 'react';
import { CogniteClient } from '@cognite/sdk';
import { render, screen } from '@testing-library/react';

import { mock as mockedAuthUtils } from '../../__mocks/auth-utils';
import { AuthContainer } from '../AuthContainer';

const mock = jest.fn().mockImplementation(() => {
  return { log: jest.fn() };
});

jest.mock('utils/log', mock);
jest.mock('@cognite/auth-utils', () => mockedAuthUtils);

describe('AuthContainer', () => {
  it('should get token from provider', () => {
    const sdkClient = new CogniteClient({ appId: 'test' });

    const Test = () => (
      <AuthContainer authError={jest.fn()} tenant="test" sdkClient={sdkClient}>
        test-content
      </AuthContainer>
    );

    render(<Test />);

    expect(screen.getByText('test-content')).toBeInTheDocument();
  });
});
