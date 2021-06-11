/* eslint-disable no-console */
import { CogniteClient } from '@cognite/sdk';
import { render, screen } from '@testing-library/react';
import { generateSidecar } from '__mocks/sidecar';

import { AuthContainer } from '../AuthContainer';

// this would be a nicer way to mock these tests
// import '@cognite/auth-utils/dist/mocks';

// @ts-expect-error - missing other keys
global.console = { warn: jest.fn(), log: console.log };

jest.mock('@cognite/auth-utils', () => {
  const original = jest.requireActual('@cognite/auth-utils');
  type callbackType = (args: unknown) => void;
  let internalCallback: callbackType;
  const onAuthChanged = (_applicationId: string, callback: callbackType) => {
    internalCallback = callback;
    return () => true;
  };
  return {
    ...original,
    getFlow: () => ({ flow: 'COGNITE_AUTH' }),
    CogniteAuth: (client: unknown) => ({
      state: {},
      getClient: () => client,
      onAuthChanged,
      loginAndAuthIfNeeded: () => {
        internalCallback({
          client,
          authState: { authenticated: true },
        });
      },
    }),
  };
});

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
  });
});
