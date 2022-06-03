import { setupServer } from 'msw/node';
import { TEST_PROJECT } from 'setupTests';

import { getMockSeismicGet } from '../__mocks/getMockSeismicGet';
import { getMockSeismicSearch } from '../__mocks/getMockSeismicSearch';
import { seismic } from '../seismic';

describe('seismic', () => {
  describe('get', () => {
    it('get should padd', async () => {
      const networkMocks = setupServer(getMockSeismicGet());
      networkMocks.listen();
      const result = await seismic.get('1', {}, TEST_PROJECT);
      expect(result).toEqual(true);
      networkMocks.close();
    });

    it('get should error', async () => {
      const networkMocks = setupServer(getMockSeismicGet(true));
      networkMocks.listen();
      const result = await seismic.get('1', {}, TEST_PROJECT);
      expect(result).toEqual({ error: true });
      networkMocks.close();
    });
  });

  describe('search', () => {
    it('search should throw without network', async () => {
      await expect(() => seismic.search({}, TEST_PROJECT)).rejects.toThrowError(
        'Bad seismic'
      );
    }, 5000);
    it('search should handle error case', async () => {
      const networkMocks = setupServer(getMockSeismicSearch(true));
      networkMocks.listen();
      expect(await seismic.search({}, TEST_PROJECT)).toEqual([]);
      networkMocks.close();
    });
    it('search should pass', async () => {
      const networkMocks = setupServer(getMockSeismicSearch());
      networkMocks.listen();
      expect(await seismic.search({}, TEST_PROJECT)).toEqual([]);
      networkMocks.close();
    });
  });
});
