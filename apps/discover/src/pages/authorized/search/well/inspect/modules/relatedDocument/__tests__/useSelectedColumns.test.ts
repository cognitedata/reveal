import { renderHook } from '@testing-library/react-hooks';
import { AppStore } from 'core';

import { testWrapper } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { useSelectedColumns } from '../useSelectedColumns';

describe('useSelectedColumns', () => {
  const renderHookWithStore = async (store: AppStore) => {
    const { result, waitForNextUpdate } = renderHook(
      () => useSelectedColumns(),
      {
        wrapper: ({ children }) => testWrapper({ store, children }),
      }
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return selected related documents columns', async () => {
    const store = getMockedStore({
      wellInspect: {
        selectedRelatedDocumentsColumns: {
          fileName: true,
          author: true,
          category: false,
        },
      },
    });
    const view = await renderHookWithStore(store);

    expect(view.map((field) => field.Header)).toEqual(['File Name', 'Author']);
  });
});
