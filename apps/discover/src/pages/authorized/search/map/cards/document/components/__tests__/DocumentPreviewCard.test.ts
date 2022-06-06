import '__mocks/mockCogniteSDK';
import { useDocumentHighlightedContent } from 'domain/documents/internal/hooks/useDocumentHighlightedContent';

import { screen, fireEvent } from '@testing-library/react';
import noop from 'lodash/noop';
import { Store } from 'redux';

import { getMockDocument } from '__test-utils/fixtures/document';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useSearchActions } from 'hooks/useSearchActions';
import { useDocumentResultHits } from 'modules/documentSearch/hooks/useDocumentResultHits';
import { useExtractParentFolder } from 'modules/documentSearch/hooks/useExtractParentFolder';
import * as feedbackActions from 'modules/feedback/actions';
import { CLEAR_SELECTED_DOCUMENT } from 'modules/map/types.actions';

import DocumentPreviewCard from '../DocumentPreviewCard';

jest.mock('modules/documentSearch/hooks/useDocumentResultHits', () => ({
  useDocumentResultHits: jest.fn(),
}));

jest.mock('modules/documentSearch/hooks/useExtractParentFolder', () => ({
  useExtractParentFolder: jest.fn(),
}));

jest.mock('modules/documentSearch/selectors', () => ({
  useLabels: jest.fn(() => []),
}));

jest.mock('hooks/useSearchActions', () => ({
  useSearchActions: jest.fn(),
}));

jest.mock(
  'domain/documents/internal/hooks/useDocumentHighlightedContent',
  () => ({
    useDocumentHighlightedContent: jest.fn(),
  })
);

describe('Favourite Content', () => {
  let doSearchSpy: any;
  let mockedDocument: any;

  const extractParentFolder = jest.fn();

  const getPage = (viewStore: Store, viewProps: { documentId: string }) =>
    testRenderer(DocumentPreviewCard, viewStore, viewProps);
  afterEach(async () => jest.clearAllMocks());

  beforeEach(() => {
    mockedDocument = getMockDocument();
    (useDocumentResultHits as any).mockImplementation(() => [mockedDocument]);
    (useDocumentHighlightedContent as jest.Mock).mockImplementation(() => []);

    doSearchSpy = jest.fn().mockImplementation(() => noop);
    (useSearchActions as jest.Mock).mockImplementation(() => {
      return { doSearch: doSearchSpy };
    });
    (useExtractParentFolder as jest.Mock).mockImplementation(
      () => extractParentFolder
    );
  });

  const defaultTestInit = async (viewProps: { documentId: string }) => {
    const store = getMockedStore();

    return {
      ...getPage(store, viewProps),
      store,
    };
  };

  it('should trigger clear selectedDocument when clicking close', async () => {
    const { store } = await defaultTestInit({
      documentId: mockedDocument.id,
    });

    const button = screen.getByTestId('preview-card-close-button');

    if (button) {
      fireEvent.click(button);
    }

    const actions = store.getActions();
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toEqual(CLEAR_SELECTED_DOCUMENT);
  });

  it('clicking the explore parent folder button should trigger extractParentFolder', async () => {
    await defaultTestInit({
      documentId: mockedDocument.id,
    });

    const button = screen.getByTestId('button-extract-parent-folder');

    if (button) {
      fireEvent.click(button);
    }

    expect(extractParentFolder).toBeCalledTimes(1);
  });

  it('clicking the feedback button should trigger setObjectFeedbackModalDocumentId', async () => {
    const spy = jest
      .spyOn(feedbackActions, 'setObjectFeedbackModalDocumentId')
      .mockImplementation(() => noop);

    await defaultTestInit({
      documentId: mockedDocument.id,
    });

    const button = screen.getByTestId('button-feedback');

    if (button) {
      fireEvent.click(button);
    }
    expect(spy).toBeCalledTimes(1);
  });
});
