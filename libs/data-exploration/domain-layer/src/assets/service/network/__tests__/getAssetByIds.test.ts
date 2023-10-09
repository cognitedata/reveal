import { setupServer } from 'msw/node';

import { mockCogniteClient } from '../../../../__mocks';
import { getAssetsFixture } from '../../__fixtures/getAssetsFixture';
import { getMockAssetsByIdsPost } from '../../__mocks/getMockAssetsByIdsPost';
import { getAssetsByIds } from '../getAssetsByIds';

const testData = getAssetsFixture();
const mockServer = setupServer(getMockAssetsByIdsPost());
describe('getAssetByIds', () => {
  beforeAll(() => {
    mockServer.listen();
  });
  afterAll(() => {
    mockServer.close();
  });

  it('should return expected result', async () => {
    const result = getAssetsByIds(mockCogniteClient, [{ id: 123 }]);

    expect(await result).toStrictEqual(testData);
  });
});
