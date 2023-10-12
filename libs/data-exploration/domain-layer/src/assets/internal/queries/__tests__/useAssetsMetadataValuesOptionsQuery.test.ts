import { renderHook, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';

import { testQueryClientWrapper as wrapper } from '@data-exploration-lib/core';

import { getAssetsMetadataValues } from '../../../service/__fixtures/getAssetsMetadataValuesFixture';
import { getMockAssetsAggregatePost } from '../../../service/__mocks';
import { useAssetsSearchAggregateQuery } from '../useAssetsSearchAggregateQuery';

const responseData = getAssetsMetadataValues();

const mockServer = setupServer(getMockAssetsAggregatePost());
describe('useAssetsMetadataValuesOptionsQuery', () => {
  beforeAll(() => {
    mockServer.listen();
  });
  afterAll(() => {
    mockServer.close();
  });
  it('should be okay', async () => {
    const { result } = renderHook(
      () => useAssetsSearchAggregateQuery({ assetsFilters: {} }),
      { wrapper }
    );

    await waitFor(() =>
      expect(result.current.data.count).toEqual(responseData[0].count)
    );
  });
});
