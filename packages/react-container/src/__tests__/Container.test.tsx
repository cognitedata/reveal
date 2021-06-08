/* eslint-disable no-console */
import React from 'react';
import { render, screen } from '@testing-library/react';

import { generateSidecar } from '__mocks/sidecar';

import { AuthConsumer } from '../components/AuthContainer';
import { ContainerWithoutI18N } from '../Container';

jest.mock('../utils', () => {
  const utils = jest.requireActual('../utils');
  return {
    ...utils,
    getTenantInfo: () => {
      return ['one', 'one'];
    },
  };
});

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
    getFlow: () => {
      return { flow: 'COGNITE_AUTH' };
    },
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

describe('ContainerWithoutI18N', () => {
  const origConsole = global.console;

  beforeAll(() => {
    // @ts-expect-error - missing other keys
    global.console = { warn: jest.fn(), log: console.log };
  });

  afterAll(() => {
    global.console = origConsole;
  });

  it('should get correctly setup cognite client', () => {
    const Test = () => {
      const sidecar = generateSidecar();

      return (
        <ContainerWithoutI18N sidecar={sidecar}>
          <AuthConsumer>
            {(authState) => {
              return (
                <>
                  <div>TEST-CONTENT</div>
                  <div>{authState.client?.getBaseUrl()}</div>
                </>
              );
            }}
          </AuthConsumer>
        </ContainerWithoutI18N>
      );
    };

    render(<Test />);

    expect(screen.getByText('TEST-CONTENT')).toBeInTheDocument();
    expect(screen.getByText('https://api.cognitedata.com')).toBeInTheDocument();

    // eslint-disable-next-line no-console
    expect(console.warn).toBeCalled();
  });
});
