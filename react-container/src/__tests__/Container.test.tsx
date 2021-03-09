import React from 'react';
import { render, screen } from '@testing-library/react';

import { generateSidecar } from '__mocks/sidecar';

import { mock as mockedAuthUtils } from '../__mocks/auth-utils';
import { AuthConsumer } from '../components/AuthContainer';
import { ContainerWithoutI18N } from '../Container';

// @ts-expect-error - missing other keys
global.console = { warn: jest.fn() };

jest.mock('@cognite/auth-utils', () => mockedAuthUtils);
jest.mock('../utils', () => {
  const utils = jest.requireActual('../utils');
  return {
    ...utils,
    getTenantInfo: () => {
      return ['one', 'one'];
    },
  };
});

describe('ContainerWithoutI18N', () => {
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
