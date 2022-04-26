// import '__mocks/mockContainerAuth'; // should be first
import '__mocks/mockCogniteSDK';

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';
import { getMockDocumentSearch } from 'services/documentSearch/__mocks/getMockDocumentSearch';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';

import { testWrapper as wrapper } from '__test-utils/renderer';

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
