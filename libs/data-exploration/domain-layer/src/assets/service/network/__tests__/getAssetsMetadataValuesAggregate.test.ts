import { setupServer } from 'msw/node';

import { mockCogniteClient } from '../../../../__mocks';
import { getAssetsMetadataValues } from '../../__fixtures/getAssetsMetadataValuesFixture';
import { getMockAssetsAggregatePost } from '../../__mocks';
import { getAssetsMetadataValuesAggregate } from '../getAssetsMetadataValuesAggregate';

const testData = getAssetsMetadataValues();
const mockServer = setupServer(getMockAssetsAggregatePost());

describe('getAssetsMetadataValuesAggregate', () => {
  beforeAll(() => {
    mockServer.listen();
  });
  afterAll(() => {
    mockServer.close();
  });
  it('should', async () => {
    const result = await getAssetsMetadataValuesAggregate(
      mockCogniteClient,
      'metadata'
    );

    expect(result).toStrictEqual(testData);
  });
});
