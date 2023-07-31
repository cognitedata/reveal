import { useDocumentSearch } from 'domain/documents/internal/hooks/useDocumentSearch';

import { useDispatch } from 'react-redux';

import { renderHook } from '@testing-library/react-hooks';

import { getMockDocumentFilter } from '__test-utils/fixtures/sidebar';
import { useProjectConfig } from 'hooks/useProjectConfig';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('hooks/useProjectConfig', () => ({
  useProjectConfig: jest.fn(),
}));

jest.mock('modules/documentSearch/selectors', () => ({
  useExtractParentFolderPath: jest.fn(),
}));

describe('useDocumentSearch hook', () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    (useDispatch as jest.Mock).mockImplementation(() => dispatch);
    (useProjectConfig as jest.Mock).mockImplementation(() => ({}));
  });

  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() => useDocumentSearch());
    waitForNextUpdate();
    return result.current;
  };

  it('should not call dispatch when search query is empty', async () => {
    const doDocumentSearch = await getHookResult();

    doDocumentSearch({});
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should call dispatch as expected', async () => {
    const doDocumentSearch = await getHookResult();

    doDocumentSearch({
      filters: { documents: { facets: getMockDocumentFilter() } },
    });
    expect(dispatch).toHaveBeenCalled();
  });
});
