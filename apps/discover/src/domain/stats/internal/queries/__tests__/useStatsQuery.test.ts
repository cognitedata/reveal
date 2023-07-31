import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { testWrapper } from '__test-utils/renderer';

import { useStatsGetQuery } from '../useStatsQuery';

const networkMocks = setupServer();

describe('useStatsQuery', () => {
  describe('useStatsGetQuery', () => {
    beforeAll(() => networkMocks.listen());
    afterAll(() => networkMocks.close());

    it('should be ok', () => {
      const { result } = renderHook(() => useStatsGetQuery(), {
        wrapper: testWrapper,
      });
      expect(result.current.data).toEqual(undefined); // this is currently turned off
    });
  });
});
