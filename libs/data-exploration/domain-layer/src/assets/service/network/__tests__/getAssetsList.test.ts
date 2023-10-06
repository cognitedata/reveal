import { setupServer } from 'msw/node';

import { mockCogniteClient } from '../../../../__mocks';
import { getAssetsFixture } from '../../__fixtures/getAssetsFixture';
import { getMockAssetsList } from '../../__mocks/getMockAssetsList';
import { getAssetsList } from '../getAssetsList';

const testData = getAssetsFixture();
const mockServer = setupServer(getMockAssetsList());
describe('getAssetsList', () => {
  beforeAll(() => {
    mockServer.listen();
  });
  afterAll(() => {
    mockServer.close();
  });

  it('should return expected result', async () => {
    const result = (await getAssetsList(mockCogniteClient, {})).items;

    expect(result.length).toBe(testData.length);
    expect(result[0].externalId).toEqual(testData[0].externalId);
    expect(result[1].parentExternalId).toEqual(testData[1].parentExternalId);
  });
});
