import 'domain/wells/__mocks/setupWellsMockSDK';
import { getMockUserMe } from 'domain/userManagementService/service/__mocks/getMockUserMe';
import { getMockRigOperation } from 'domain/wells/rigOperations/service/__fixtures/getMockRigOperation';
import { getMockRigOperationsListPostError } from 'domain/wells/rigOperations/service/__mocks/getMockCasingsListPostError';
import { getMockRigOperationsListPost } from 'domain/wells/rigOperations/service/__mocks/getMockRigOperationsListPost';

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { testWrapper as wrapper } from '__test-utils/renderer';

import { useRigOperationsQuery } from '../useRigOperationsQuery';

const mockServer = setupServer(getMockUserMe());

const mockRigOperation = getMockRigOperation();

const renderRigOperationsQueryHook = () => {
  return renderHook(
    () =>
      useRigOperationsQuery({
        wellboreIds: [mockRigOperation.wellboreMatchingId],
      }),
    { wrapper }
  );
};

describe('useRigOperationsQuery', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return data', async () => {
    mockServer.use(getMockRigOperationsListPost());

    const { result, waitFor } = renderRigOperationsQueryHook();

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => result.current.isLoading === false);
    expect(result.current.data?.[0]).toEqual(
      expect.objectContaining({
        wellboreMatchingId: mockRigOperation.wellboreMatchingId,
      })
    );
  });

  it('should return empty array for server error', async () => {
    mockServer.use(getMockRigOperationsListPostError());

    const { result, waitFor } = renderRigOperationsQueryHook();

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => result.current.isLoading === false);
    expect(result.current.data).toEqual([]);
  });
});
