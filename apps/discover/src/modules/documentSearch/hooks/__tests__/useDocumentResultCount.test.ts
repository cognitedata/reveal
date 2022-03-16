import 'services/documents/__mocks/setupDocumentsMockSDK';
import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';

import { testWrapper as wrapper } from '__test-utils/renderer';
import { getMockDocumentSearch } from 'modules/documentSearch/__mocks/getMockDocumentSearch';

import { useDocumentResultCount } from '../useDocumentResultCount';

const mockServer = setupServer(getMockDocumentSearch(), getMockConfigGet());

describe('useDocumentResultCount', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  test('should return document result count', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useDocumentResultCount(),
      { wrapper }
    );
    expect(result.current).toEqual(0);
    await waitForNextUpdate();
    expect(result.current).toEqual(400);
  });
});
