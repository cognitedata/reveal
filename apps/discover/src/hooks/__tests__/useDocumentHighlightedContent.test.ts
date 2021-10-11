import { renderHook } from '@testing-library/react-hooks';

import { getMockDocument } from '__test-utils/fixtures/document';
import { testWrapper } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { useDocumentHighlightedContent } from '../useDocumentHighlightedContent';

describe('useDocumentHighlightedContent hook', () => {
  it('should return `isLoading` as `true` when both `data` and `error` not exist', async () => {
    const store = getMockedStore();
    const document = getMockDocument();
    const { result, waitForNextUpdate } = renderHook(
      () => useDocumentHighlightedContent(document),
      {
        wrapper: ({ children }) => testWrapper({ store, children }),
      }
    );
    waitForNextUpdate();
    const [data, isLoading, error] = result.current;

    expect(data).toBeFalsy();
    expect(isLoading).toBeTruthy();
    expect(error).toBeFalsy();
  });
});
