import { getMockSavedSearchRelatedGet } from 'domain/savedSearches/service/__mocks/getMockSavedSearchRelatedGet';

import { screen, fireEvent } from '@testing-library/react';
import { setupServer } from 'msw/node';

import { testRenderer, testReRender } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { SET_RELATED_DOCUMENTS_FILTERS } from '../../../../../../../../modules/inspectTabs/types';
import { RelatedDocumentSearch } from '../RelatedDocumentSearch';

const mockServer = setupServer(getMockSavedSearchRelatedGet());

const store = getMockedStore();

const SEARCH_PHRASE = 'search-phrase';

describe('Related Document search', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it(`should press enter`, async () => {
    await testRenderer(RelatedDocumentSearch, store, null);

    const input = screen.getByTestId('input-search');
    fireEvent.change(input, { target: { value: SEARCH_PHRASE } });

    fireEvent.keyPress(input, { key: 'Enter', keyCode: 13, code: 'Enter' });
    expect(input).toHaveValue(SEARCH_PHRASE);
    const actions = store.getActions();
    expect(actions[0].type).toBe(SET_RELATED_DOCUMENTS_FILTERS);
    expect(actions[0].payload.query).toBe(SEARCH_PHRASE);
  });

  test('should empty the input on clear query', async () => {
    const storeWithSearchPhrase = getMockedStore({
      inspectTabs: { relatedDocuments: { filters: { query: SEARCH_PHRASE } } },
    });
    const { rerender } = await testRenderer(
      RelatedDocumentSearch,
      storeWithSearchPhrase,
      null
    );
    const input = screen.getByTestId('input-search');
    expect(input).toHaveValue(SEARCH_PHRASE);
    const storeWithEmptySearchPhrase = getMockedStore({
      inspectTabs: { relatedDocuments: { filters: { query: '' } } },
    });
    await testReRender(
      rerender,
      RelatedDocumentSearch,
      storeWithEmptySearchPhrase,
      null
    );
    expect(input).toHaveValue('');
  });
});
