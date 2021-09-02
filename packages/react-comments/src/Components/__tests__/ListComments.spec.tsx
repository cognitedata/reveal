import { screen, waitFor } from '@testing-library/react';
import { testRenderer } from '__test_utils__/testRenderer';
import { useAuthContext, getAuthHeaders } from '@cognite/react-container';

import { ListComments } from '../ListComments';
import {
  mockListComments,
  serviceUrl,
  testProject,
} from '../../__test_utils__/listComments';

// need to figure out how to export this with BAZEL from react-container
const mocks = {
  useAuthContext: () => {
    return {
      authState: { id: 'test-id', project: testProject, email: 'test-email' },
    };
  },
  getAuthHeaders: () => ({}),
};

jest.mock('@cognite/react-container', () => {
  return {
    useAuthContext: jest.fn(),
    getAuthHeaders: jest.fn(),
  };
});

describe('ListComments', () => {
  beforeAll(() => mockListComments.listen());
  afterAll(() => mockListComments.close());

  it('should load without user id', async () => {
    (useAuthContext as jest.Mock).mockImplementation(mocks.useAuthContext);

    testRenderer(ListComments, {
      target: {
        id: 'test',
        targetType: 'test-target',
      },
      project: testProject,
      serviceUrl,
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should be ok in good case', async () => {
    (useAuthContext as jest.Mock).mockImplementation(mocks.useAuthContext);
    (getAuthHeaders as jest.Mock).mockImplementation(mocks.getAuthHeaders);

    testRenderer(ListComments, {
      target: {
        id: 'test',
        targetType: 'test-target',
      },
      project: testProject,
      userId: 'test-user',
      serviceUrl,
    });

    await waitFor(() => screen.findByText('first comment'));

    expect(screen.getByText('second comment')).toBeInTheDocument();
  });
});
