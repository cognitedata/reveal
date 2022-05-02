import '__mocks/mockCogniteSDK';
import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { getMockDocument } from '__test-utils/fixtures/document';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { Metadata } from 'components/DocumentPreview';
import { DocumentMetadata } from 'modules/documentSearch/types';

jest.mock('hooks/useDocumentLabels', () => ({
  useDocumentLabelsByExternalIds: () => ['unclassified'],
}));

describe('Metadata overlay', () => {
  let mockedDocument: any;

  const page = (viewStore: Store, viewProps: { doc: DocumentMetadata }) =>
    testRenderer(Metadata, viewStore, viewProps);

  const defaultTestInit = async () => {
    const store = getMockedStore();

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
