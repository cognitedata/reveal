import '__mocks/mockContainerAuth';
import '__mocks/mockCogniteSDK';
import { getMockDocumentCategoriesGet } from 'domain/documents/service/__mocks/getMockDocumentCategoriesGet';

import { waitFor, screen, fireEvent, within } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockDocumentSearch } from 'services/documentSearch/__mocks/getMockDocumentSearch';
import { getMockFavoritesListGet } from 'services/favorites/__mocks/getMockFavoritesListGet';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import { getMockSavedSearchCurrentGet } from 'services/savedSearches/__mocks/getMockSavedSearchCurrentGet';

import { getMockAPIResponse } from '__test-utils/fixtures/document';
import { getDocumentFixture } from '__test-utils/fixtures/documents/getDocumentFixture';
import { testRenderer } from '__test-utils/renderer';
import { MockStore, getMockedStore } from '__test-utils/store.utils';
import { SELECT_DOCUMENT_IDS } from 'modules/documentSearch/types.actions';
import { ZOOM_TO_COORDS } from 'modules/map/types.actions';

import {
  ADD_TO_FAVORITES_OPTION_TEXT,
  LEAVE_FEEDBACK_OPTION_TEXT,
  OPEN_PARENT_FOLDER_OPTION_TEXT,
} from '../../constants';
import { DocumentResultTable } from '../DocumentResultTable';

const mockServer = setupServer(
  getMockConfigGet(),
  getMockDocumentSearch(
    getMockAPIResponse([
      {
        item: getDocumentFixture(
          {
            id: 1,
            externalId: 1,
            author: 'FIRST-DOC-AUTHOR',
          },
          {
            id: 1,
            sourceCreatedTime: new Date(1396357611000),
            name: 'FIRST TEST-DOC',
            size: 1,
          }
        ),
      },
      {
        item: getDocumentFixture(
          {
            id: 2,
            externalId: 2,
            author: 'TEST-AUTHOR-2',
          },
          {
            id: 2,
            sourceCreatedTime: new Date(1396351611000),
            name: 'SECOND TEST-DOC-2',
            size: 2,
          }
        ),
      },
      {
        item: getDocumentFixture(
          {
            id: 3,
            externalId: 3,
            geoLocation: undefined,
          },
          {
            id: 3,
            sourceCreatedTime: new Date(1396351611000),
            name: 'NO GEO DOC',
            size: 3,
          }
        ),
      },
    ])
  ),
  getMockFavoritesListGet(),
  getMockSavedSearchCurrentGet(),
  getMockDocumentCategoriesGet()
);

describe('CheckboxTableResult', () => {
  const renderPage = async (store: MockStore) => {
    testRenderer(DocumentResultTable, store);

    // confirm page is loaded before moving on
    await screen.findByTitle('FIRST-DOC-AUTHOR');
    return { store };
  };

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should render a document result', async () => {
    await renderPage(getMockedStore());

    expect(await screen.findByTitle('FIRST-DOC-AUTHOR')).toBeInTheDocument();
  });

  it('should render cell elements', async () => {
    await renderPage(getMockedStore());

    const rows = screen.getAllByTestId('table-row');
    expect(within(rows[0]).getAllByTestId('table-cell')[2]).toHaveTextContent(
      'FIRST TEST-DOC'
    );
    expect(within(rows[1]).getAllByTestId('table-cell')[2]).toHaveTextContent(
      'SECOND TEST-DOC-2'
    );
    expect(within(rows[0]).getAllByTestId('table-cell')[8]).toHaveTextContent(
      'FIRST-DOC-AUTHOR'
    );
    expect(within(rows[1]).getAllByTestId('table-cell')[8]).toHaveTextContent(
      'TEST-AUTHOR-2'
    );
  });

  it('should not dispatch action with hover', async () => {
    const { store } = await renderPage(getMockedStore());

    fireEvent.mouseOver(screen.getByTitle('FIRST-DOC-AUTHOR'), {
      bubbles: true,
    });
    fireEvent.mouseOver(screen.getByTitle('TEST-AUTHOR-2'), { bubbles: true });

    await waitFor(() => expect(store.getActions().length).toEqual(0), {
      timeout: 300,
    });
  });

  it('should dispatch `mapProvider/zoomToCoords` action when click on a row and geo location exists', async () => {
    const { store } = await renderPage(getMockedStore());

    fireEvent.click(screen.getByTitle('TEST-AUTHOR-2'));
    await waitFor(() => expect(store.getActions().length).toEqual(1));
    expect(store.getActions()[0].type).toEqual(ZOOM_TO_COORDS);
  });

  it('should not dispatch `mapProvider/zoomToCoords` action when click on a row and geo location is `undefined`', async () => {
    const { store } = await renderPage(getMockedStore());

    fireEvent.click(screen.getByLabelText('TEST-AUTHOR-2'));
    await waitFor(() => expect(store.getActions().length).toEqual(0));
  });

  it('should dispatch `mapProvider/zoomToCoords` action when double click on a row and geo location exists', async () => {
    const { store } = await renderPage(getMockedStore());

    fireEvent.doubleClick(screen.getByTitle('TEST-AUTHOR-2'));
    await waitFor(() => expect(store.getActions().length).toEqual(1));
    expect(store.getActions()[0].type).toEqual(ZOOM_TO_COORDS);
  });

  it('should not dispatch `mapProvider/zoomToCoords` action when double click on a row and geo location is `undefined`', async () => {
    const { store } = await renderPage(getMockedStore());

    fireEvent.doubleClick(screen.getByText('NO GEO DOC'));
    expect(store.getActions().length).toEqual(0);
  });

  it('should dispatch relevant actions when select a check-box', async () => {
    // since all these tests use store, some get in conflict with slow actions
    // even though it's more code, doing it this way is more stable
    const { store } = await renderPage(getMockedStore());

    // confirm page is loaded before moving on
    await screen.findByTitle('FIRST-DOC-AUTHOR');

    const checkboxes = screen.getAllByRole('checkbox', {
      name: 'Toggle Row Selected',
    });
    fireEvent.click(checkboxes[1]);

    const actions = await store.getActions();
    expect(actions[0].type).toEqual(SELECT_DOCUMENT_IDS);
    expect(actions[0].ids).toEqual(['2']);
  });

  it('should dispatch relevant actions when select all check-boxes', async () => {
    const { store } = await renderPage(getMockedStore());

    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Toggle All Rows Selected',
      })
    );

    const actions = await store.getActions();
    expect(actions.length).toEqual(1);
    expect(actions[0].type).toEqual(SELECT_DOCUMENT_IDS);
  });

  it('should render option menu when mouse enter', async () => {
    await renderPage(getMockedStore());

    fireEvent.mouseEnter(screen.getAllByTestId('menu-button')[0], {
      bubbles: true,
    });
    expect(
      screen.getByText(OPEN_PARENT_FOLDER_OPTION_TEXT)
    ).toBeInTheDocument();
    expect(screen.getByText(LEAVE_FEEDBACK_OPTION_TEXT)).toBeInTheDocument();
    expect(screen.getByText(ADD_TO_FAVORITES_OPTION_TEXT)).toBeInTheDocument();
  });
});
