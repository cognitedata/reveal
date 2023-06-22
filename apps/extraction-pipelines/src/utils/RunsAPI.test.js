import sdk from '@cognite/cdf-sdk-singleton';
import { PROJECT_ITERA_INT_GREEN } from './baseURL';
import { getFilteredRuns } from './RunsAPI';

describe('RunsAPI', () => {
  describe('getFilteredRuns', () => {
    test('Calls sdk get and returns response data', async () => {
      const response = { data: { items: [], nextCursor: '' } };
      sdk.post.mockResolvedValue(response);
      const res = await getFilteredRuns(
        sdk,
        PROJECT_ITERA_INT_GREEN,
        'my_external_id',
        'thisisthenext',
        10
      );
      expect(sdk.post).toHaveBeenCalledTimes(1);
      expect(res).toEqual(response.data);
    });
  });
});
