import { renderHook } from '@testing-library/react-hooks';

import { useAppliedDocumentFilters } from 'modules/sidebar/selectors';

import { useAppliedDocumentFiltersFacetsKeys } from '../useAppliedDocumentFiltersFacetsKeys';

jest.mock('modules/sidebar/selectors', () => ({
  useAppliedDocumentFilters: jest.fn(),
}));

describe('useAppliedDocumentsFacetsKeys hook', () => {
  beforeEach(() => {
    (useAppliedDocumentFilters as jest.Mock).mockImplementation(() => ({
      fileCategory: ['fileCategory1', 'fileCategory2'],
      labels: [],
      lastmodified: [],
      lastcreated: [],
      location: ['location1'],
    }));
  });

  it('should return applied document facets keys', () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAppliedDocumentFiltersFacetsKeys()
    );
    waitForNextUpdate();

    expect(result.current).toEqual(['fileCategory', 'location']);
  });
});
