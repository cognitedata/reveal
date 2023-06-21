import {
  getReFetchInterval,
  QUERY_REFETCH_INTERVAL_AFTER_HOUR_ELAPSED,
  QUERY_REFETCH_INTERVAL_BEFORE_HOUR_ELAPSED,
} from '../getReFetchInterval';
import { TimeUtils } from '../timeUtils';

describe('utils/getReFetchInterval', () => {
  describe('should return correct reFetch interval based on time elapsed', () => {
    it('should return correct reFetch interval called within milliseconds', () => {
      expect(getReFetchInterval(Date.now())).toEqual(
        QUERY_REFETCH_INTERVAL_BEFORE_HOUR_ELAPSED
      );
    });

    it('should return correct reFetch interval if before elapsed hour', () => {
      const time30MinBefore = TimeUtils.addMinutes(Date.now(), -30);
      const time59MinBefore = TimeUtils.addMinutes(Date.now(), -59);

      expect(getReFetchInterval(time30MinBefore)).toEqual(
        QUERY_REFETCH_INTERVAL_BEFORE_HOUR_ELAPSED
      );
      expect(getReFetchInterval(time59MinBefore)).toEqual(
        QUERY_REFETCH_INTERVAL_BEFORE_HOUR_ELAPSED
      );
    });
    it('should return correct reFetch interval if after elapsed hour', () => {
      const time60MinBefore = TimeUtils.addMinutes(Date.now(), -60);
      const time100MinBefore = TimeUtils.addMinutes(Date.now(), -100);
      expect(getReFetchInterval(time60MinBefore)).toEqual(
        QUERY_REFETCH_INTERVAL_AFTER_HOUR_ELAPSED
      );
      expect(getReFetchInterval(time100MinBefore)).toEqual(
        QUERY_REFETCH_INTERVAL_AFTER_HOUR_ELAPSED
      );
    });
    it('should return correct reFetch interval if a day has passed', () => {
      const timeExactlyDayAgo = TimeUtils.addDays(Date.now(), -1);
      const timeExactlyDayAndHalfAgo = TimeUtils.addDays(Date.now(), -1.5);

      expect(getReFetchInterval(timeExactlyDayAgo)).toEqual(false);
      expect(getReFetchInterval(timeExactlyDayAndHalfAgo)).toEqual(false);
    });
  });
});
