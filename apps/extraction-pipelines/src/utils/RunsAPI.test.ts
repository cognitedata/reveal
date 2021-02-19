import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { PROJECT_ITERA_INT_GREEN } from './baseURL';
import { createParams, DEFAULT_LIMIT, getRuns } from './RunsAPI';

describe('RunsAPI', () => {
  describe('CreateParams', () => {
    test('creates params', () => {
      const externalId = 'external_id_1';
      const nextCursor = 'thisisthecursor';
      const limit = 20;
      const res = createParams(externalId, nextCursor, limit);
      expect(res.includes(externalId)).toEqual(true);
      expect(res.includes(nextCursor)).toEqual(true);
      expect(res.includes(limit)).toEqual(true);
    });
    test('not include cursor if not provided. Default limit', () => {
      const externalId = 'external_id_1';
      const res = createParams(externalId, null);
      expect(res.includes(externalId)).toEqual(true);
      expect(res.includes('cursor')).toEqual(false);
      expect(res.includes('null')).toEqual(false);
      expect(res.includes(DEFAULT_LIMIT)).toEqual(true);
    });
  });
  describe('getRuns', () => {
    test('Calls sdk get and returns response data', async () => {
      const response = { data: { items: [], nextCursor: '' } };
      sdkv3.get.mockResolvedValue(response);
      const res = await getRuns(
        PROJECT_ITERA_INT_GREEN,
        'my_external_id',
        'thisisthenext',
        10
      );
      expect(sdkv3.get).toHaveBeenCalledTimes(1);
      expect(res).toEqual(response.data);
    });
  });
});

// export const getRuns = async (
//   project: string,
//   externalId: string,
//   nextCursor: Nullable<Pick<RunsAPIResponse, 'nextCursor'>>,
//   limit: number = defaultLimit
// ): Promise<RunsAPIResponse> => {
//   const response = await get<RunsAPIResponse>(
//     `/runs`,
//     project,
//     createParams(externalId, nextCursor, limit)
//   );
//   return response.data;
// };
