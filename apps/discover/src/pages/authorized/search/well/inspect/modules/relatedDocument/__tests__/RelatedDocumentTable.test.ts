import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { getMockDocument } from '__test-utils/fixtures/document';
import { mockedWellStateWithSelectedWells } from '__test-utils/fixtures/well';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { initialState } from 'modules/documentSearch/reducer';

import { RelatedDocumentTableComponent } from '../RelatedDocumentTable';

const setupStore = () => {
  const store = getMockedStore({
    documentSearch: {
      ...initialState,
      result: {
        count: 1,
        hits: [getMockDocument()],
      },
      selectedDocumentIds: [],
    },
    ...mockedWellStateWithSelectedWells,
  });

  return store;
};

describe('RelatedDocument Table Page', () => {
  const renderPage = (store: Store) =>
    testRenderer(RelatedDocumentTableComponent, store);

  it('should render ok', async () => {
    await renderPage(setupStore());

    expect(screen.getByText('File Name')).toBeInTheDocument();
    expect(screen.getByText('Author')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Top Folder')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
  });
});
