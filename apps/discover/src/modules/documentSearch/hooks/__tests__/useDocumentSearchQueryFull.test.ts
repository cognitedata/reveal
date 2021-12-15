import { renderHook } from '@testing-library/react-hooks';

import { useExtractParentFolderPath } from 'modules/documentSearch/selectors';
import { useSearchPhrase } from 'modules/sidebar/selectors';

import { useDocumentConfig } from '../useDocumentConfig';
import { useDocumentSearchQueryFull } from '../useDocumentSearchQueryFull';

jest.mock('modules/sidebar/selectors', () => ({
  useAppliedDocumentFilters: jest.fn(),
  useAppliedDocumentMapLayerFilters: jest.fn(),
  useAppliedMapGeoJsonFilters: jest.fn(),
  useSearchPhrase: jest.fn(),
}));

jest.mock('modules/map/selectors', () => ({
  useGeoFilter: jest.fn(),
}));

jest.mock('../../selectors', () => ({
  useExtractParentFolderPath: jest.fn(),
}));

jest.mock('../useDocumentConfig', () => ({
  useDocumentConfig: jest.fn(),
}));

describe('useDocumentSearchQueryFull hook', () => {
  const searchPhrase = 'TestSearchPhrase';
  const extractParentFolderPath = '/extractParentFolderPath';

  beforeEach(() => {
    (useSearchPhrase as jest.Mock).mockImplementation(() => searchPhrase);
    (useDocumentConfig as jest.Mock).mockImplementation(() => ({ data: {} }));
  });

  const getHookResult = () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useDocumentSearchQueryFull()
    );
    waitForNextUpdate();
    return result.current;
  };

  describe('Document search', () => {
    it('should have `searchPhrase` when `extractByFilepath` is falsy', () => {
      const searchQuery = getHookResult();
      expect(searchQuery.phrase).toEqual(searchPhrase);
    });

    it('should have `searchPhrase` when `extractByFilepath` is `true`', () => {
      (useDocumentConfig as jest.Mock).mockImplementation(() => ({
        data: { extractByFilepath: true },
      }));

      const searchQuery = getHookResult();
      expect(searchQuery.phrase).toEqual(searchPhrase);
    });
  });

  describe('Extract parent folder', () => {
    beforeEach(() => {
      (useExtractParentFolderPath as jest.Mock).mockImplementation(
        () => extractParentFolderPath
      );
    });

    it('should have `extractParentFolderPath` when `extractByFilepath` is falsy', () => {
      const searchQuery = getHookResult();
      expect(searchQuery.phrase).toEqual(extractParentFolderPath);
    });

    it('should have `path` prefix for `extractParentFolderPath` when `extractByFilepath` is `true`', () => {
      (useDocumentConfig as jest.Mock).mockImplementation(() => ({
        data: { extractByFilepath: true },
      }));

      const searchQuery = getHookResult();
      expect(searchQuery.phrase).toEqual(`path:"${extractParentFolderPath}"`);
    });
  });
});
