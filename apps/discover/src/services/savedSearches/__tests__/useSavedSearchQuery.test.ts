import '__mocks/mockContainerAuth'; // should be first
import { setupServer } from 'msw/node';

import { renderHookWithStore } from '__test-utils/renderer';

import { getSavedSearchResponseFixture } from '../__fixtures/getSavedSearchResponseFixture';
import { getMockSavedSearchCurrentGet } from '../__mocks/getMockSavedSearchCurrentGet';
import { getMockSavedSearchGet } from '../__mocks/getMockSavedSearchGet';
import { getMockSavedSearchList } from '../__mocks/getMockSavedSearchList';
import { getMockSavedSearchRelatedGet } from '../__mocks/getMockSavedSearchRelatedGet';
import {
  useQuerySavedSearchRelatedDocuments,
  useQuerySavedSearchCurrent,
  useQuerySavedSearchesList,
  useQuerySavedSearcheGetOne,
} from '../useSavedSearchQuery';

const networkMocks = setupServer(
  getMockSavedSearchCurrentGet(),
  getMockSavedSearchRelatedGet(),
  getMockSavedSearchList(),
  getMockSavedSearchGet()
);

describe('useSavedSearchQuery', () => {
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
});
