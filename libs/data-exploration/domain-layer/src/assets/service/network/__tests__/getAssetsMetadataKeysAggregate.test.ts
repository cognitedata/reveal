import { setupServer } from 'msw/node';

import { mockCogniteClient } from '../../../../__mocks';
import { getAssetsMetadataValues } from '../../__fixtures/getAssetsMetadataValuesFixture';
import { getMockAssetsAggregatePost } from '../../__mocks';
import { getAssetsMetadataKeysAggregate } from '../getAssetsMetadataKeysAggregate';

const testData = getAssetsMetadataValues();
const mockServer = setupServer(getMockAssetsAggregatePost([testData[0]]));
describe('getAssetsMetadataKeysAggregate', () => {
  beforeAll(() => {
    mockServer.listen();
  });
  afterAll(() => {
    mockServer.close();
  });

  it('should return expected result', async () => {
    const result = getAssetsMetadataKeysAggregate(mockCogniteClient);

    expect(await result).toStrictEqual([
      {
        count: testData[0].count,
        value: testData[0].value.property[1],
        values: [testData[0].values[0].property[1]],
      },
    ]);
  });
});
