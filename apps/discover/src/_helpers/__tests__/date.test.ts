import {
  getDateOrDefaultText,
  shortDateTime,
  getYear,
  getDocumentFormatFromDate,
  shortDate,
  shortDateToDate,
  toDate,
  startOf,
  endOf,
  ifRangeIsSameTimeModifyToDayRange,
  now,
  subtract,
  fromNow,
  dateToEpoch,
  getYearFromNumber,
  isValidDate,
  getDateByMatchingRegex,
} from '../date';

describe('date helpers', () => {
  describe('toEpoch', () => {
    test('should be ok', () => {
      expect(dateToEpoch(new Date('2000'))).toEqual(946684800000);
    });

    test('empty', () => {
      expect(dateToEpoch('')).toEqual(0);
    });

    test('should return millisecond from string date', () => {
      expect(dateToEpoch(new Date('2000').toISOString())).toEqual(946684800000);
    });

    test('should return year from the date', () => {
      const date = new Date('2000');
      expect(getYearFromNumber(date.toISOString())).toEqual(2000);
      expect(getYearFromNumber(date.getTime())).toEqual(2000);
    });

    test('should subtract time from given date', () => {
      const date = now();
      const deductTime = 1000;

      expect(date - deductTime).toEqual(
        subtract(date, deductTime, 'milliseconds').valueOf()
      );
      const dateObject = new Date(2000, 1, 12);

      expect(dateObject.getTime() - deductTime).toEqual(
        subtract(dateObject, deductTime, 'milliseconds').valueOf()
      );
    });

    test('should return time upto now', () => {
      const date = new Date(2011, 1, 12).getTime();
      expect(fromNow(date)).toContain('years ago');
    });

    test('should return date or default text', () => {
      expect(getDateOrDefaultText()).toEqual('N/A');
      expect(getDateOrDefaultText('')).toEqual('N/A');
      expect(getDateOrDefaultText(new Date('2000'))).toEqual('01.Jan.2000');
    });

    test('should return short date time', () => {
      expect(shortDateTime('20200101_070314', 'YYYYMMDD_HHmmss')).toEqual(
        '01.Jan.20 07:03:14'
      );
    });
    test('should return short date', () => {
      const date = new Date(2000, 1, 12);

      expect(shortDate(date)).toEqual('12.Feb.2000');
      expect(shortDate(date.toISOString())).toEqual('12.Feb.2000');
      expect(shortDate(date.getTime())).toEqual('12.Feb.2000');
    });

    test('should return date for short date string', () => {
      const date = new Date(2000, 1, 12);
      const shortDateValue = shortDate(date);

      expect(shortDateToDate(shortDateValue)).toEqual(date);
    });

    test('should return date for date string or number', () => {
      const date = new Date(2000, 1, 12);
      expect(toDate(date.toISOString())).toEqual(date);
      expect(toDate(date.getTime())).toEqual(date);
    });

    test('should return year', () => {
      expect(getYear('20200105')).toEqual(2020);
    });

    test('should return empty when date is unavailable', () => {
      expect(getDocumentFormatFromDate()).toEqual('');
    });

    test('should return Document format', () => {
      expect(getDocumentFormatFromDate(new Date('2020-01-05'))).toContain(
        '2020-01-05'
      );
    });

    test('Should return start of the day', () => {
      const date = new Date(2021, 2, 17, 11, 30, 30);
      expect(startOf(date, 'day')).toEqual(new Date(2021, 2, 17, 0, 0, 0));
    });

    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('Should return date as millisecond', () => {
      const date = new Date(2021, 2, 17, 11, 30, 30);
      expect(dateToEpoch(date)).toEqual(1615977030000);
    });

    test('Should return end of the day', () => {
      const date = new Date(2021, 2, 17, 11, 30, 30);
      expect(endOf(date, 'day')).toEqual(
        new Date(2021, 2, 17, 23, 59, 59, 999)
      );
    });
    test('Should match with regex', () => {
      const date = '12-12-2012';
      const resultDate = getDateByMatchingRegex(date);
      expect(resultDate).toEqual(date);
    });

    describe('date time helpers', () => {
      describe('ifRangeIsSameTimeModifyToDayRange', () => {
        test('Should return same range since range is not same time', () => {
          const range = {
            startDate: new Date(2021, 2, 17, 11, 30, 30),
            endDate: new Date(2021, 2, 18, 11, 30, 30),
          };
          const [start, end] = ifRangeIsSameTimeModifyToDayRange(range);
          expect(start).toEqual(range.startDate);
          expect(end).toEqual(range.endDate);
        });
        test('Should manipulate range since range is same time', () => {
          const range = {
            startDate: new Date(2021, 2, 17, 11, 30, 30),
            endDate: new Date(2021, 2, 17, 11, 30, 30),
          };
          const [start, end] = ifRangeIsSameTimeModifyToDayRange(range);
          expect(start).toEqual(new Date(2021, 2, 17, 0, 0, 0));
          expect(end).toEqual(new Date(2021, 2, 17, 23, 59, 59, 999));
        });
      });

      describe('isValidDate', () => {
        test('should return correct boolean', () => {
          expect(isValidDate(new Date())).toBeTruthy();
          expect(isValidDate(shortDate(new Date(2020, 11, 21)))).toBeTruthy();

          // we expect a warning to be thrown by momentjs
          expect(isValidDate('some test date')).toBeFalsy();
        });
      });
    });
  });
});
