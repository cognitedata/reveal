import { testQueryClientWrapper as wrapper } from '@data-exploration-lib/core';
import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { getMock3DModels } from '../../../__mocks/getMock3DModels';
import { useInfinite3DModelsQuery } from '../useInfinite3DModelsQuery';

const mockServer = setupServer(getMock3DModels());
describe('useInfinite3DModelsQuery', () => {
  beforeAll(() => {
    mockServer.listen();
  });
  afterAll(() => {
    mockServer.close();
  });
  it('should be okay', async () => {
    const { result, waitFor } = renderHook(() => useInfinite3DModelsQuery(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toEqual(false), {
      timeout: 10000,
    });

    expect(result.current.data?.pages[0].items.length).toEqual(4);
  });
});
