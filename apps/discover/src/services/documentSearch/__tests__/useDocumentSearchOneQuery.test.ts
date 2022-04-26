import '__mocks/mockCogniteSDK'; // never miss this import

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { testWrapper } from '__test-utils/renderer';
import { getMockDocumentSearch } from 'modules/documentSearch/__mocks/getMockDocumentSearch';

import { useDocumentSearchOneQuery } from '../useDocumentSearchOneQuery';

const mockServer = setupServer(getMockDocumentSearch({ items: [] }));

describe('useDocumentSearchOneQuery', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should be undefined', async () => {
    const { result, waitForNextUpdate } = await renderHook(
      () => useDocumentSearchOneQuery(123),
      {
        wrapper: testWrapper,
      }
    );
    await waitForNextUpdate();

    expect(result.current.data).toBeUndefined();
    expect(result.current.status).toBe('success');
  });
});
