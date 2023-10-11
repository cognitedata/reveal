import { setupServer } from 'msw/node';

import { mockCogniteClient } from '../../../../__mocks';
import { getAssetsFixture } from '../../__fixtures/getAssetsFixture';
import { getMockAssetsByIdsPost } from '../../__mocks/getMockAssetsByIdsPost';
import { getRootAsset } from '../getRootAsset';

describe('getRootAsset', () => {
  describe('Undefined result', () => {
    const mockServer = setupServer(getMockAssetsByIdsPost([]));
    beforeAll(() => {
      mockServer.listen();
    });
    afterAll(() => {
      mockServer.close();
    });

    it('should return expected result', async () => {
      const result = getRootAsset(mockCogniteClient, 123);

      expect(await result).toBeUndefined();
    });
  });

  describe('Expected result', () => {
    const testData = getAssetsFixture();
    const mockServer = setupServer(getMockAssetsByIdsPost());
    beforeAll(() => {
      mockServer.listen();
    });
    afterAll(() => {
      mockServer.close();
    });

    it('should return expected result', async () => {
      const result = getRootAsset(mockCogniteClient, 123);

      expect(await result).toStrictEqual(testData[0]);
    });
  });
});
