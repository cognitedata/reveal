import { useDocumentSearchResultQuery } from 'domain/documents/service/queries/useDocumentSearchResultQuery';

import { useQueryClient } from 'react-query';

import { renderHook } from '@testing-library/react-hooks';

import { getMockDocument } from '__test-utils/fixtures/document';
import { DOCUMENTS_QUERY_KEY } from 'constants/react-query';
import { getEmptyDocumentStateFacets } from 'modules/documentSearch/utils';

import { useRemoveSensitiveDocument } from '../useRemoveSensitiveDocument';

jest.mock('react-query', () => ({
  useQueryClient: jest.fn(),
}));

jest.mock('modules/documentSearch/hooks/useDocumentSearchOptions', () => ({
  useDocumentSearchOptions: jest.fn(),
}));

jest.mock('modules/documentSearch/hooks/useDocumentSearchQueryFull', () => ({
  useDocumentSearchQueryFull: jest.fn(),
}));

jest.mock(
  'domain/documents/service/queries/useDocumentSearchResultQuery',
  () => ({
    useDocumentSearchResultQuery: jest.fn(),
  })
);

describe('useRemoveSensitiveDocument hook', () => {
  const setQueryData = jest.fn();

  const document1 = getMockDocument();
  const document2 = getMockDocument();
  const documentResult = {
    hits: [document1, document2],
    count: 2,
    facets: getEmptyDocumentStateFacets(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useQueryClient as jest.Mock).mockImplementation(() => ({ setQueryData }));
    (useDocumentSearchResultQuery as jest.Mock).mockImplementation(() => ({
      results: documentResult,
    }));
  });

  const getHookResult = () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useRemoveSensitiveDocument()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should remove given document id from document results', () => {
    const removeSensitiveDocument = getHookResult();
    removeSensitiveDocument(document1.id);
    expect(setQueryData).toHaveBeenCalledWith(
      [DOCUMENTS_QUERY_KEY.SEARCH, undefined, undefined],
      {
        ...documentResult,
        hits: [document2],
        count: 1,
      }
    );
  });

  it('should not call `setQueryData` when given document id is not found', () => {
    const removeSensitiveDocument = getHookResult();
    removeSensitiveDocument('non-existing-document-id');
    expect(setQueryData).not.toHaveBeenCalled();
  });
});
