import 'domain/wells/__mocks/setupWellsMockSDK';
import { setupServer } from 'msw/node';

import { getMockCasingsList } from '__mocks/mockCasings';

import { fetchCasingsUsingWellsSDK } from '../casing';

const mockServer = setupServer(getMockCasingsList());

const ASSETID_1 = '1';
const ASSETID_2 = '2';

describe('casing', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  describe('fetchCasingsUsingWellsSDK', () => {
    test('fetch casings with well sdk when no ids are sent and source map is empty', async () => {
      const result = await fetchCasingsUsingWellsSDK([], {});

      expect(result).toEqual({});
    });

    test('fetch casings with well sdk when wellboreIds & source map is sent', async () => {
      const result = await fetchCasingsUsingWellsSDK(
        ['wellbore A', 'wellbore B'],
        {
          'wellbore A': ASSETID_1,
          'wellbore B': ASSETID_2,
        }
      );

      expect(result[ASSETID_1]).toBeDefined();
      expect(result[ASSETID_2]).toBeDefined();
    });
  });
});
