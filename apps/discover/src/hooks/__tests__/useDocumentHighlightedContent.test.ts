import '__mocks/mockCogniteSDK';
import { useDocumentHighlightedContent } from 'domain/documents/internal/hooks/useDocumentHighlightedContent';
import { getDocumentFixture as mockDocumentFixture } from 'domain/documents/service/__fixtures/getDocumentFixture';

import { renderHook } from '@testing-library/react-hooks';

import { getMockDocument as mockDocument } from '__test-utils/fixtures/document';
import { testWrapper } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

jest.mock('domain/documents/service/utils/getDocumentSDKClient', () => ({
  getDocumentSDKClient: () => ({
    documents: {
      search: jest
        .fn()
        .mockResolvedValue({ items: [{ item: mockDocumentFixture() }] }),
    },
  }),
}));

describe('useDocumentHighlightedContent hook', () => {
  it('should return `isLoading` as `true` when both `data` and `error` not exist', async () => {
    const store = getMockedStore();
    const document = mockDocument();
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
