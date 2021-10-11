import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { getMockDocument } from '__test-utils/fixtures/document';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { DocumentMetadata } from 'modules/documentSearch/types';
import { Metadata } from 'pages/authorized/search/map/cards/document/components/Metadata';

jest.mock('hooks/useDocumentLabels', () => ({
  useDocumentLabelsByExternalIds: () => ['unclassified'],
}));

describe('Metadata overlay', () => {
  let mockedDocument: any;

  const page = (viewStore: Store, viewProps: { doc: DocumentMetadata }) =>
    testRenderer(Metadata, viewStore, viewProps);

  const defaultTestInit = async () => {
    const store = getMockedStore({
      documentSearch: {
        result: {
          facets: {
            labels: [
              {
                name: 'unclassified',
                key: 'unclassified',
                count: 2656,
                selected: false,
              },
            ],
          },
        },
      },
    });

    return { ...page(store, { doc: mockedDocument }), store };
  };

  afterEach(async () => jest.clearAllMocks());

  beforeEach(() => {
    mockedDocument = getMockDocument();
  });

  it('should display correct Doc Type labels', async () => {
    await defaultTestInit();
    expect(screen.getByText('unclassified')).toBeInTheDocument();
  });
});
