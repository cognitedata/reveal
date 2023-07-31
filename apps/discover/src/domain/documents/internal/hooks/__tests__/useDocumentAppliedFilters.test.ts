import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { getMockAppliedFiltersType } from '__test-utils/fixtures/sidebar';

import { useDocumentAppliedFilterEntries } from '../useDocumentAppliedFilters';

describe('Document Applied Filters', () => {
  it('load applied filters', () => {
    const appliedFilters = getMockAppliedFiltersType();

    const { result, waitForNextUpdate } = renderHook(() =>
      useDocumentAppliedFilterEntries(appliedFilters.documents)
    );

    act(() => {
      waitForNextUpdate();
    });

    const data = result.current;

    expect(data[0][0]).toEqual('fileCategory');
    expect(data[0][1]).toEqual(['Compressed', 'Image']);
    expect(data[1][0]).toEqual('labels');
  });
});
