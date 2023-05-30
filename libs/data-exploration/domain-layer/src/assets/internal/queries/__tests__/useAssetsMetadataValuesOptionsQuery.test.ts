import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { testQueryClientWrapper as wrapper } from '@data-exploration-lib/core';

import { getMockAssetsAggregatePost } from '../../../service/__mocks';
import { useAssetsSearchAggregateQuery } from '../useAssetsSearchAggregateQuery';

const mockServer = setupServer(getMockAssetsAggregatePost());
describe('useAssetsMetadataValuesOptionsQuery', () => {
  beforeAll(() => {
    mockServer.listen();
  });
  afterAll(() => {
    mockServer.close();
  });
  it('should be okay', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useAssetsSearchAggregateQuery({ assetsFilters: {} }),
      { wrapper }
    );

    await waitForNextUpdate();
    expect(result.current.data.count).toEqual(43);
  });
});
