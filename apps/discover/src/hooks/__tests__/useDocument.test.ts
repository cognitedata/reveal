import '__mocks/mockCogniteSDK';

import { useDocument } from 'domain/documents/internal/hooks/useDocument';
import { getMockDocumentSearch } from 'domain/documents/service/__mocks/getMockDocumentSearch';

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

const mockServer = setupServer(getMockDocumentSearch());

describe('useDocument hook', () => {
  const externalId = 'aa123aa';

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return `isLoading` as `true` when both `doc` and `error` not exist', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useDocument(externalId)
    );

    waitForNextUpdate();
    const [doc, isLoading, error] = result.current;

    expect(doc).toBeFalsy();
    expect(isLoading).toBeTruthy();
    expect(error).toBeFalsy();
  });
});
