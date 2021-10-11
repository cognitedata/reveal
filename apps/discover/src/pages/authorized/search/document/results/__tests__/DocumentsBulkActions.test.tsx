import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { DocumentsBulkActions } from '../DocumentsBulkActions';

describe('DocumentsBulkActions', () => {
  const defaultTestInit = async () => {
    const store = getMockedStore();
    return testRenderer(DocumentsBulkActions, store, {
      selectedDocumentIds: [],
    });
  };

  it('should render `DocumentsBulkActions` as expected', async () => {
    await defaultTestInit();
    expect(screen.getByTestId('table-bulk-actions')).toBeInTheDocument();
  });
});
