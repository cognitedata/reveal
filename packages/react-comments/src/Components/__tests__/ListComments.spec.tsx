import { setupServer } from 'msw/node';
import { screen, waitFor } from '@testing-library/react';
import { testRenderer } from '__test_utils__/testRenderer';
import {
  useAuthContext,
  getAuthHeaders,
  getTenantInfo,
} from '@cognite/react-container';
import { getMockNetworkUserGet } from '__test_utils__/getMockNetworkUserGet';

import { ListComments } from '../ListComments';
import {
  getMockNetworkListComments,
  serviceUrl,
  testProject,
} from '../../__test_utils__/getMockNetworkListComments';

// need to figure out how to export this with BAZEL from react-container
const mocks = {
  useAuthContext:
    (id = 'test-id') =>
    () => {
      return {
        authState: { id, project: testProject, email: 'test-email' },
      };
    },
  getAuthHeaders: () => ({}),
  getTenantInfo: () => ['test', 'test', 'test'],
};

jest.mock('@cognite/react-container', () => {
  return {
    useAuthContext: jest.fn(),
    getAuthHeaders: jest.fn(),
    getTenantInfo: jest.fn(),
  };
});

const networkMocks = setupServer(
  getMockNetworkUserGet('test-id'),
  getMockNetworkListComments()
);

describe('ListComments', () => {
  beforeAll(() => networkMocks.listen());
  afterAll(() => networkMocks.close());

  it('should load without id', async () => {
    (useAuthContext as jest.Mock).mockImplementation(mocks.useAuthContext(''));
    (getTenantInfo as jest.Mock).mockImplementation(mocks.getTenantInfo);

    testRenderer(ListComments, {
      target: {
        id: '',
        targetType: '',
      },
      userManagementServiceBaseUrl: serviceUrl,
      commentServiceBaseUrl: serviceUrl,
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should be ok in good case', async () => {
    (useAuthContext as jest.Mock).mockImplementation(mocks.useAuthContext());
    (getTenantInfo as jest.Mock).mockImplementation(mocks.getTenantInfo);
    (getAuthHeaders as jest.Mock).mockImplementation(mocks.getTenantInfo);

    testRenderer(ListComments, {
      target: {
        id: 'test',
        targetType: 'test-target',
      },
      userManagementServiceBaseUrl: serviceUrl,
      commentServiceBaseUrl: serviceUrl,
    });

    await waitFor(() => screen.findByText('first comment'));

    expect(screen.getByText('second comment')).toBeInTheDocument();
  });
});
