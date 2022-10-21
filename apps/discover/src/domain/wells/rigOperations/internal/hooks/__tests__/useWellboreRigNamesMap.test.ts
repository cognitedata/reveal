import { getMockRigOperation } from 'domain/wells/rigOperations/service/__fixtures/getMockRigOperation';

import { renderHook } from '@testing-library/react-hooks';

import { testWrapper as wrapper } from '__test-utils/renderer';

import { useRigOperationsQuery } from '../../queries/useRigOperationsQuery';
import { useWellboreRigNamesMap } from '../useWellboreRigNamesMap';

jest.mock('../../queries/useRigOperationsQuery', () => ({
  useRigOperationsQuery: jest.fn(),
}));

describe('useWellboreRigNamesMap', () => {
  it('should return empty object if no data', async () => {
    (useRigOperationsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { result } = renderHook(
      () => useWellboreRigNamesMap({ wellboreIds: ['test-wellbore'] }),
      { wrapper }
    );

    expect(result.current.data).toMatchObject({});
    expect(result.current.isLoading).toEqual(true);
  });

  it('should return rig names map', async () => {
    const mockRigOperation = getMockRigOperation();
    const { wellboreMatchingId, rigName } = mockRigOperation;

    (useRigOperationsQuery as jest.Mock).mockReturnValue({
      data: [mockRigOperation],
      isLoading: false,
    });

    const { result } = renderHook(
      () => useWellboreRigNamesMap({ wellboreIds: [wellboreMatchingId] }),
      { wrapper }
    );

    expect(result.current.data).toMatchObject({
      [wellboreMatchingId]: [rigName],
    });
    expect(result.current.isLoading).toEqual(false);
  });
});
