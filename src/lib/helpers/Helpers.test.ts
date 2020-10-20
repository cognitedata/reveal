import {
  sleep,
  mergeItems,
  boundedParallelRequests,
  stuffForUnitTests,
} from './Helpers';

function manualPromise(resolveWith, rejectWith) {
  let res;
  let rej;
  const p = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  p.resolveExternal = () => res(resolveWith);
  p.resolveExternalValue = v => res(v);
  p.rejectExternal = () => rej(rejectWith);
  p.rejectExternalValue = v => rej(v);

  return p;
}

describe('Helpers', () => {
  describe('boundedparallelrequests', () => {
    it('should send all requests in one go for small groups of requests', async () => {
      const api = jest.fn().mockResolvedValue('ok');
      const PARALLEL_REQUESTS = 5;
      const data1 = [[1, 2]];

      // Should only start
      await boundedParallelRequests(api, data1, PARALLEL_REQUESTS);

      expect(api.mock.calls.length).toBe(1);
      expect(api).toHaveBeenNthCalledWith(1, [1, 2]);
    });

    it('should send each group in the request parameter', async () => {
      const PARALLEL_REQUESTS = 5;
      const api = jest.fn().mockResolvedValue('ok');
      const data1 = [
        [1, 2],
        [3, 4],
        [5, 6],
      ];

      // Should only start
      await boundedParallelRequests(api, data1, PARALLEL_REQUESTS);

      expect(api.mock.calls.length).toBe(3);
      expect(api).toHaveBeenNthCalledWith(1, [1, 2]);
      expect(api).toHaveBeenNthCalledWith(2, [3, 4]);
      expect(api).toHaveBeenNthCalledWith(3, [5, 6]);

      api.mockReset();

      await boundedParallelRequests(api, data1, 1);

      expect(api.mock.calls.length).toBe(3);
      expect(api).toHaveBeenNthCalledWith(1, [1, 2]);
      expect(api).toHaveBeenNthCalledWith(2, [3, 4]);
      expect(api).toHaveBeenNthCalledWith(3, [5, 6]);
    });

    describe('should run `fn` in parallel', () => {
      it('should run all inputs in parallel if length < n', async () => {
        const apiFn = jest
          .fn()
          .mockImplementation(() => sleep(100).then(() => 'ok'));
        const data = [42, 43, 44];

        const done = boundedParallelRequests(apiFn, data, 5);

        expect(apiFn.mock.calls.length).toBe(3);
        expect(apiFn).toHaveBeenNthCalledWith(1, 42);
        expect(apiFn).toHaveBeenNthCalledWith(2, 43);
        expect(apiFn).toHaveBeenNthCalledWith(3, 44);

        const result = await done;

        expect(result).toEqual(['ok', 'ok', 'ok']);
      });

      it('should limit the concurrent requests to n', async () => {
        let allRequestsDone = false;
        let promises = [];
        const apiFn = jest.fn().mockImplementation(v => {
          const p = manualPromise(v);
          promises.push(p);
          return p;
        });
        const data = [42, 43, 44, 45, 46, 47];

        const done = boundedParallelRequests(apiFn, data, 2);
        done.then(() => {
          allRequestsDone = true;
        });

        expect(apiFn.mock.calls.length).toBe(2);
        expect(apiFn).toHaveBeenNthCalledWith(1, 42);
        expect(apiFn).toHaveBeenNthCalledWith(2, 43);
        expect(allRequestsDone).toBe(false);

        promises.forEach(p => {
          p.resolveExternal();
        });
        promises = [];
        await sleep(1);

        expect(apiFn.mock.calls.length).toBe(4);
        expect(apiFn).toHaveBeenNthCalledWith(1, 42);
        expect(apiFn).toHaveBeenNthCalledWith(2, 43);
        expect(apiFn).toHaveBeenNthCalledWith(3, 44);
        expect(apiFn).toHaveBeenNthCalledWith(4, 45);
        expect(allRequestsDone).toBe(false);

        promises.forEach(p => {
          p.resolveExternal();
        });
        promises = [];
        await sleep(1);

        expect(apiFn.mock.calls.length).toBe(6);
        expect(apiFn).toHaveBeenNthCalledWith(1, 42);
        expect(apiFn).toHaveBeenNthCalledWith(2, 43);
        expect(apiFn).toHaveBeenNthCalledWith(3, 44);
        expect(apiFn).toHaveBeenNthCalledWith(4, 45);
        expect(apiFn).toHaveBeenNthCalledWith(5, 46);
        expect(apiFn).toHaveBeenNthCalledWith(6, 47);

        promises.forEach(p => {
          p.resolveExternal();
        });
        promises = [];
        await sleep(1);

        await done;

        expect(allRequestsDone).toBe(true);
      });

      it('should add the odd last one ot the the last request batch', async () => {
        let allRequestsDone = false;

        let promises = [];
        const apiFn = jest.fn().mockImplementation(v => {
          const p = manualPromise(v);
          promises.push(p);
          return p;
        });
        // 3 requests, max 2 concurrent
        const data = [42, 43, 44];

        const done = boundedParallelRequests(apiFn, data, 2);
        done.then(() => {
          allRequestsDone = true;
        });

        expect(apiFn.mock.calls.length).toBe(2);
        expect(apiFn).toHaveBeenNthCalledWith(1, 42);
        expect(apiFn).toHaveBeenNthCalledWith(2, 43);
        expect(allRequestsDone).toBe(false);

        promises.forEach(p => {
          p.resolveExternal();
        });
        promises = [];
        await sleep(1);

        expect(apiFn.mock.calls.length).toBe(3);
        expect(apiFn).toHaveBeenNthCalledWith(1, 42);
        expect(apiFn).toHaveBeenNthCalledWith(2, 43);
        expect(apiFn).toHaveBeenNthCalledWith(3, 44);

        promises.forEach(p => {
          p.resolveExternal();
        });
        promises = [];
        await sleep(1);

        await done;

        expect(allRequestsDone).toBe(true);
      });
    });
  });
  describe('oneAtATime', () => {
    const { oneAtATime } = stuffForUnitTests;
    it('should not call the mock function again before the first one resolves', async () => {
      let promises = [];
      const apiFn = jest.fn().mockImplementation(v => {
        const p = manualPromise(v);
        promises.push(p);
        return p;
      });

      const data = ['request1', 'request2', 'request3'];
      expect(apiFn.mock.calls.length).toBe(0);

      oneAtATime(apiFn, data);
      expect(apiFn.mock.calls.length).toBe(1);
      expect(apiFn).toHaveBeenNthCalledWith(1, 'request1');

      promises.forEach(p => {
        p.resolveExternal();
      });
      promises = [];
      await sleep(1);

      expect(apiFn.mock.calls.length).toBe(2);
      expect(apiFn).toHaveBeenNthCalledWith(1, 'request1');
      expect(apiFn).toHaveBeenNthCalledWith(2, 'request2');

      promises.forEach(p => {
        p.resolveExternal();
      });
      promises = [];
      await sleep(1);

      expect(apiFn.mock.calls.length).toBe(3);
      expect(apiFn).toHaveBeenNthCalledWith(1, 'request1');
      expect(apiFn).toHaveBeenNthCalledWith(2, 'request2');
      expect(apiFn).toHaveBeenNthCalledWith(3, 'request3');
    });
  });

  describe('mergeItems', () => {
    it('should overwrite old results', () => {
      expect(
        mergeItems(
          [{ id: 1, name: 'new name' }],
          {
            1: { id: 1, name: 'old name' },
          },
          'id'
        )
      ).toEqual({
        1: {
          id: 1,
          name: 'new name',
        },
      });
    });
    it('default key', () => {
      expect(
        mergeItems([{ id: 1, name: 'new name' }], {
          1: { id: 1, name: 'old name' },
        })
      ).toEqual({
        1: {
          id: 1,
          name: 'new name',
        },
      });
    });
  });
});
