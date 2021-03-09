import React from 'react';
import { CogniteClient } from '@cognite/sdk';
import { render, screen } from '@testing-library/react';

import { generateSidecar } from '__mocks/sidecar';
import { mock as mockedAuthUtils } from '../../__mocks/auth-utils';
import { AuthContainer } from '../AuthContainer';

// @ts-expect-error - missing other keys
global.console = { warn: jest.fn() };

jest.mock('@cognite/auth-utils', () => mockedAuthUtils);

describe('AuthContainer', () => {
  it('should get token from provider', () => {
    const sdkClient = new CogniteClient({ appId: 'test' });
    const sidecar = generateSidecar();

    const Test = () => (
      <AuthContainer
        sidecar={sidecar}
        authError={jest.fn()}
        tenant="test"
        sdkClient={sdkClient}
      >
        test-content
      </AuthContainer>
    );

    render(<Test />);

    expect(screen.getByText('test-content')).toBeInTheDocument();

    // eslint-disable-next-line no-console
    expect(console.warn).toBeCalledWith(
      '[AuthContainer] UnAuthenticated state found, going to login page.',
      undefined
    );
  });
});
