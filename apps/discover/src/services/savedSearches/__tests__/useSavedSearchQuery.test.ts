import '__mocks/mockContainerAuth'; // should be first
import { act } from 'react-test-renderer';

import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';

import { renderHookWithStore } from '__test-utils/renderer';

import { getSavedSearchResponseFixture } from '../__fixtures/getSavedSearchResponseFixture';
import { getMockSavedSearchCurrentGet } from '../__mocks/getMockSavedSearchCurrentGet';
import { getMockSavedSearchCurrentPut } from '../__mocks/getMockSavedSearchCurrentPut';
import { getMockSavedSearchGet } from '../__mocks/getMockSavedSearchGet';
import { getMockSavedSearchList } from '../__mocks/getMockSavedSearchList';
import { getMockSavedSearchRelatedGet } from '../__mocks/getMockSavedSearchRelatedGet';
import {
  useQuerySavedSearchRelatedDocuments,
  useQuerySavedSearchCurrent,
  useQuerySavedSearchesList,
  useQuerySavedSearcheGetOne,
  useMutatePatchSavedSearch,
} from '../useSavedSearchQuery';

describe('useSavedSearchQuery', () => {
  const networkMocks = setupServer(
    getMockSavedSearchCurrentGet(),
    getMockSavedSearchRelatedGet(),
    getMockSavedSearchList(),
    getMockSavedSearchGet(),
    getMockConfigGet(),
    getMockSavedSearchCurrentPut()
  );
  beforeAll(() => networkMocks.listen());
  afterAll(() => networkMocks.close());

  describe('useQuerySavedSearchRelatedDocuments', () => {
    it('should be ok', async () => {
      const { result, waitFor } = renderHookWithStore(() =>
        useQuerySavedSearchRelatedDocuments()
      );
      await waitFor(() => expect(result.current.isFetched).toEqual(true));
      expect(result.current.data).toEqual(getSavedSearchResponseFixture());
    });
  });

  describe('useQuerySavedSearchCurrent', () => {
    it('should be ok', async () => {
      const { result, waitFor } = renderHookWithStore(() =>
        useQuerySavedSearchCurrent()
      );
      await waitFor(() => expect(result.current.isFetched).toEqual(true));
      expect(result.current.data).toEqual(getSavedSearchResponseFixture());
    });
  });

  describe('useQuerySavedSearchesList', () => {
    it('should be ok', async () => {
      const { result, waitFor } = renderHookWithStore(() =>
        useQuerySavedSearchesList()
      );
      await waitFor(() => expect(result.current.isFetched).toEqual(true));
      expect(result.current.data?.length).toEqual(1);
    });
  });

  describe('useQuerySavedSearcheGetOne', () => {
    it('should be ok', async () => {
      const { result, waitFor } = renderHookWithStore(() =>
        useQuerySavedSearcheGetOne('1')
      );
      await waitFor(() => expect(result.current.isFetched).toEqual(true));
      expect(result.current.data).toMatchObject({ id: '1' });
    });
  });

  describe('useMutatePatchSavedSearch', () => {
    const successCallback = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('should return expected output', async () => {
      const { result } = renderHookWithStore(() =>
        useMutatePatchSavedSearch(true, successCallback)
      );

      await act(() =>
        result.current.mutateAsync({}).then((response) => {
          expect(successCallback).toBeCalledTimes(1);
          expect(response).toBeTruthy();
        })
      );
    });

    it('should return expected output `doSearch` equals false and without `successCallback`', async () => {
      const { result } = renderHookWithStore(() =>
        useMutatePatchSavedSearch(false)
      );

      await act(() =>
        result.current.mutateAsync({}).then((response) => {
          expect(successCallback).toBeCalledTimes(0);
          expect(response).toBeTruthy();
        })
      );
    });
  });
});
