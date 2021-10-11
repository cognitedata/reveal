import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { WellsBulkActions } from '../WellsBulkActions';

describe('WellsBulkActions', () => {
  const defaultTestInit = async () => {
    const store = getMockedStore();
    return testRenderer(WellsBulkActions, store);
  };

  it('should render `WellsBulkActions` as expected', async () => {
    await defaultTestInit();
    expect(screen.getByTestId('table-bulk-actions')).toBeInTheDocument();
  });
});
