import { waitFor, screen, fireEvent } from '@testing-library/react';
import { Store } from 'redux';

import { getMockDocument } from '__test-utils/fixtures/document';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { initialState as documentSearchState } from 'modules/documentSearch/reducer';

import { DocumentResultTable } from '../DocumentResultTable';

const setupStore = (extras: any = {}) => {
  const store = getMockedStore({
    documentSearch: {
      ...documentSearchState,
      result: {
        count: 1,
        hits: [
          getMockDocument(
            { filename: 'TEST-DOC' },
            { author: 'FIRST-DOC-AUTHOR' }
          ),
          getMockDocument(
            { filename: 'TEST-DOC-2', ...extras },
            { author: 'TEST-AUTHOR-2' }
          ),
        ],
      },
      selectedDocumentIds: [],
    },
  });

  return store;
};

describe('CheckboxTableResult', () => {
  const renderPage = (store: Store) => testRenderer(DocumentResultTable, store);

  it('should render a document result', () => {
    renderPage(setupStore());
    expect(screen.getByText('FIRST-DOC-AUTHOR')).toBeInTheDocument();
  });

  it('should not trigger hover for stuff with no geo location', async () => {
    const store = setupStore({
      geolocation: { type: 'Polygon', coordinates: [] },
    });

    renderPage(store);

    fireEvent.mouseOver(screen.getByText('FIRST-DOC-AUTHOR'));
    fireEvent.mouseOver(screen.getByText('TEST-AUTHOR-2'));

    // we timeout the check since the dispatch happens after a debounce
    // @todo(PP-2044)
    // eslint-disable-next-line testing-library/await-async-utils
    waitFor(() => expect(store.getActions().length).toEqual(1), {
      timeout: 300,
    });
    // @todo(PP-2044)
    // eslint-disable-next-line testing-library/await-async-utils
    waitFor(
      () => expect(store.getActions()[0].type).toEqual('SET_HOVERED_DOCUMENT'),
      { timeout: 300 }
    );
  });

  // how to test this one? don't have a mouseOut event
  it('should not trigger hover when nothing has been hovered', async () => {
    const store = setupStore({
      geolocation: { type: 'Polygon', coordinates: [] },
    });

    renderPage(store);

    fireEvent.mouseOver(screen.getByText('FIRST-DOC-AUTHOR'));
    fireEvent.mouseLeave(screen.getByText('FIRST-DOC-AUTHOR'));
    fireEvent.mouseOver(screen.getByText('TEST-AUTHOR-2'));
    fireEvent.mouseLeave(screen.getByText('TEST-AUTHOR-2'));

    // @todo(PP-2044)
    // eslint-disable-next-line testing-library/await-async-utils
    waitFor(() => expect(store.getActions().length).toEqual(1));
  });
});
