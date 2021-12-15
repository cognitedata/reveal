import { waitFor, screen, fireEvent, within } from '@testing-library/react';

import { getMockDocument } from '__test-utils/fixtures/document';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useDocumentSearchResultQuery } from 'modules/documentSearch/hooks/useDocumentSearchResultQuery';
import { SELECT_DOCUMENT_IDS } from 'modules/documentSearch/types.actions';
import { ZOOM_TO_COORDS } from 'modules/map/types.actions';

import {
  ADD_TO_FAVORITES_OPTION_TEXT,
  LEAVE_FEEDBACK_OPTION_TEXT,
  OPEN_PARENT_FOLDER_OPTION_TEXT,
} from '../../constants';
import { DocumentResultTable } from '../DocumentResultTable';

jest.mock('modules/documentSearch/hooks/useDocumentSearchResultQuery', () => ({
  useDocumentSearchResultQuery: jest.fn(),
}));

const mockDocumentResult = (extras: any = {}) => {
  (useDocumentSearchResultQuery as jest.Mock).mockImplementation(() => ({
    data: {
      count: 1,
      hits: [
        getMockDocument(
          {},
          { author: 'FIRST-DOC-AUTHOR', filename: 'FIRST TEST-DOC' }
        ),
        getMockDocument(
          { ...extras },
          { author: 'TEST-AUTHOR-2', filename: 'SECOND TEST-DOC-2' }
        ),
      ],
    },
  }));
};

describe('CheckboxTableResult', () => {
  const store = getMockedStore();
  const renderPage = () => testRenderer(DocumentResultTable, store);

  afterEach(() => store.clearActions());

  it('should render a document result', () => {
    mockDocumentResult();
    renderPage();
    expect(screen.getByText('FIRST-DOC-AUTHOR')).toBeInTheDocument();
  });

  it('should render cell elements', async () => {
    mockDocumentResult();
    renderPage();

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
    mockDocumentResult({
      geolocation: { type: 'Polygon', coordinates: [] },
    });
    renderPage();

    fireEvent.mouseOver(screen.getByText('FIRST-DOC-AUTHOR'), {
      bubbles: true,
    });
    fireEvent.mouseOver(screen.getByText('TEST-AUTHOR-2'), { bubbles: true });

    await waitFor(() => expect(store.getActions().length).toEqual(0), {
      timeout: 300,
    });
  });

  it('should dispatch `mapProvider/zoomToCoords` action when click on a row and geo location is not `undefined`', async () => {
    mockDocumentResult({
      geolocation: { type: 'Point', coordinates: [] },
    });
    renderPage();

    fireEvent.click(screen.getByText('TEST-AUTHOR-2'));
    await waitFor(() => expect(store.getActions().length).toEqual(1));
    expect(store.getActions()[0].type).toEqual(ZOOM_TO_COORDS);
  });

  it('should not dispatch `mapProvider/zoomToCoords` action when click on a row and geo location is `undefined`', async () => {
    mockDocumentResult();
    renderPage();

    fireEvent.click(screen.getByText('TEST-AUTHOR-2'));
    await waitFor(() => expect(store.getActions().length).toEqual(0));
  });

  it('should dispatch `mapProvider/zoomToCoords` action when double click on a row and geo location is not `undefined`', async () => {
    mockDocumentResult({
      geolocation: { type: 'Point', coordinates: [] },
    });
    renderPage();

    fireEvent.doubleClick(screen.getByText('TEST-AUTHOR-2'));
    await waitFor(() => expect(store.getActions().length).toEqual(1));
    expect(store.getActions()[0].type).toEqual(ZOOM_TO_COORDS);
  });

  it('should not dispatch `mapProvider/zoomToCoords` action when double click on a row and geo location is `undefined`', async () => {
    mockDocumentResult();
    renderPage();

    fireEvent.doubleClick(screen.getByText('TEST-AUTHOR-2'));
    expect(store.getActions().length).toEqual(0);
  });

  it('should dispatch relevant actions when select a check-box', async () => {
    mockDocumentResult({
      geolocation: { type: 'Point', coordinates: [] },
    });
    renderPage();

    const checkboxes = screen.getAllByRole('checkbox', {
      name: 'Toggle Row Selected',
    });
    fireEvent.click(checkboxes[0]);

    const actions = await store.getActions();
    expect(actions.length).toEqual(1);
    expect(actions[0].type).toEqual(SELECT_DOCUMENT_IDS);
  });

  it('should dispatch relevant actions when select all check-boxes', async () => {
    mockDocumentResult({
      geolocation: { type: 'Point', coordinates: [] },
    });
    renderPage();

    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Toggle All Rows Selected',
      })
    );

    const actions = await store.getActions();
    expect(actions.length).toEqual(1);
    expect(actions[0].type).toEqual(SELECT_DOCUMENT_IDS);
  });

  it('should render more option menu when mouse enter', () => {
    mockDocumentResult();
    renderPage();

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
