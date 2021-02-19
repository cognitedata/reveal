import React from 'react';
import { render, screen } from '@testing-library/react';
import { mock as mockedAuthUtils } from '../__mocks/auth-utils';

import { AuthConsumer } from '../components/AuthContainer';
import { ContainerWithoutI18N } from '../Container';

jest.mock('@cognite/auth-utils', () => mockedAuthUtils);
jest.mock('../utils', () => {
  const utils = jest.requireActual('../utils');
  return {
    ...utils,
    getSidecar: jest.fn(() => ({
      applicationId: 'test-app',
      cdfApiBaseUrl: 'test-api',
    })),
    getTenantInfo: () => {
      return ['one', 'one'];
    },
  };
});

describe('ContainerWithoutI18N', () => {
  it('should get correctly setup cognite client', () => {
    const Test = () => {
      return (
        <ContainerWithoutI18N disableTranslations>
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
    expect(screen.getByText('test-api')).toBeInTheDocument();
  });
});
