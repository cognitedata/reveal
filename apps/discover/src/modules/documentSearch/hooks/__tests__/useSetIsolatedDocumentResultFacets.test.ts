import { useDispatch } from 'react-redux';

import { renderHook } from '@testing-library/react-hooks';

import { DocumentsFacets } from 'modules/documentSearch/types';
import { useGeoFilter } from 'modules/map/selectors';
import { useSearchPhrase } from 'modules/sidebar/selectors';

import { useSetIsolatedDocumentResultFacets } from '../useSetIsolatedDocumentResultFacets';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('modules/map/selectors', () => ({
  useGeoFilter: jest.fn(),
}));

jest.mock('modules/sidebar/selectors', () => ({
  useSearchPhrase: jest.fn(),
}));

describe('useSetIsolatedDocumentResultFacets hook', () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    (useDispatch as jest.Mock).mockImplementation(() => dispatch);
    (useGeoFilter as jest.Mock).mockImplementation(() => ['TestGeoFilter']);
    (useSearchPhrase as jest.Mock).mockImplementation(() => 'TestSearchPrase');
  });

  it('should dispatch isolated search action', () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSetIsolatedDocumentResultFacets()
    );
    waitForNextUpdate();
    const setIsolatedDocumentResultFacets = result.current;

    const isolatedDocumentsFacets: Partial<DocumentsFacets> = {
      filetype: ['TestFileType'],
    };

    setIsolatedDocumentResultFacets(isolatedDocumentsFacets);

    expect(dispatch).toBeCalled();
  });
});
