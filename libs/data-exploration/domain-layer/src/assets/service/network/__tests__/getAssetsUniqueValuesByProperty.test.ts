import { setupServer } from 'msw/node';

import { mockCogniteClient } from '../../../../__mocks';
import { getAssetsMetadataValues } from '../../__fixtures/getAssetsMetadataValuesFixture';
import { getMockAssetsAggregatePost } from '../../__mocks';
import { getAssetsUniqueValuesByProperty } from '../getAssetsUniqueValuesByProperty';

const testData = getAssetsMetadataValues();
const mockServer = setupServer(getMockAssetsAggregatePost());

describe('getAssetsUniqueValuesByProperty', () => {
  beforeAll(() => {
    mockServer.listen();
  });
  afterAll(() => {
    mockServer.close();
  });
  it('should', async () => {
    const result = await getAssetsUniqueValuesByProperty(
      mockCogniteClient,
      'labels'
    );

    expect(result).toStrictEqual(testData);
  });
});
