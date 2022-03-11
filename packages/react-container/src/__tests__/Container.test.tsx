/* eslint-disable no-console */
import { saveFlow } from '@cognite/auth-utils';
import { setupServer } from 'msw/node';
import { saveToLocalStorage } from '@cognite/storage';
import { render, screen, waitFor } from '@testing-library/react';
import { mockApplicationName, mockSidecar } from '@cognite/sidecar';

import { FAKE_IDP_USER_LS_KEY } from '../components/LoginWithFakeIDP';
import { ContainerWithoutI18N } from '../Container';
import { fakeIdpLoginPost } from '../__test-utils__/fakeIdpPostMock';

// mock fake idp login response
const networkMocks = setupServer(fakeIdpLoginPost());

describe('ContainerWithoutI18N', () => {
  const origConsole = global.console;
  beforeAll(() => {
    // @ts-expect-error - missing other keys
    global.console = { warn: jest.fn(), log: console.log, error: jest.fn() };
    networkMocks.listen();
  });

  afterAll(() => {
    global.console = origConsole;
    networkMocks.close();
  });

  // this test is flaky, stops at a loading screen in the tenant-selector
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should show tenant selector initially when no project is specified in the url', async () => {
    const Test = () => {
      const sidecar = mockSidecar();
      return (
        <ContainerWithoutI18N sidecar={sidecar}>
          <div>
            <p>TEST-CONTENT</p>
          </div>
        </ContainerWithoutI18N>
      );
    };

    await render(<Test />);

    await screen.findByText('Sing in to');
    expect(screen.getAllByText(mockApplicationName)).toHaveLength(2);
    expect(screen.queryByText('TEST-CONTENT')).not.toBeInTheDocument();
  });

  it('should log error and return to login page if no auth flow found for project', async () => {
    window.location.assign('/test-project');

    const Test = () => {
      const sidecar = mockSidecar();
      return (
        <ContainerWithoutI18N sidecar={sidecar}>
          <div>
            <p>TEST-CONTENT</p>
          </div>
        </ContainerWithoutI18N>
      );
    };

    await render(<Test />);
    await waitFor(() => {
      expect(screen.queryByText('Sing in to')).not.toBeInTheDocument();
    });

    await waitFor(() =>
      expect(console.error).toHaveBeenCalledWith(
        'Missing auth flow for project: test-project'
      )
    );
    expect(window.location.assign).toHaveBeenCalledWith('/');
    expect(window.location.href).toEqual('http://localhost/');
  });

  it('should try to authenticate with fakeIdp', async () => {
    window.location.assign('/test-project');
    saveFlow('FAKE_IDP', {}, 'test-project');
    saveToLocalStorage(FAKE_IDP_USER_LS_KEY, 'test-user');

    const Test = () => {
      const sidecar = mockSidecar({
        fakeIdp: [
          {
            cluster: 'ew1',
            fakeApplicationId: 'appId',
            groups: [],
            name: 'test-user',
            otherAccessTokenFields: {},
            otherIdTokenFields: {},
            project: 'test-project',
            roles: [],
          },
        ],
      });
      return (
        <ContainerWithoutI18N sidecar={sidecar}>
          <div>
            <p>TEST-CONTENT</p>
          </div>
        </ContainerWithoutI18N>
      );
    };
    await render(<Test />);
    await waitFor(() =>
      expect(screen.queryByText('Sing in to')).not.toBeInTheDocument()
    );

    // eslint-disable-next-line testing-library/prefer-find-by
    await waitFor(() =>
      expect(screen.getByText('TEST-CONTENT')).toBeInTheDocument()
    );
  });
});
