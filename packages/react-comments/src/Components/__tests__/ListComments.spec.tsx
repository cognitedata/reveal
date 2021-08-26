import { screen, waitFor } from '@testing-library/react';
import { testRenderer } from '__test_utils__/testRenderer';
// import mocks from '@cognite/react-container/dist/mocks';

import { ListComments } from '../ListComments';
import {
  mockListComments,
  serviceUrl,
  testProject,
} from '../../__test_utils__/listComments';

jest.mock('@cognite/react-container', () => {
  return {
    useAuthContext: () => ({
      authState: { project: testProject, email: 'test-email' },
    }),
    getAuthHeaders: () => ({}),
  };
});

describe('ListComments', () => {
  beforeAll(() => mockListComments.listen());
  afterAll(() => mockListComments.close());

  it('should load without user id', async () => {
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
