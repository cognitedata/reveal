import {
  adaptLocalEpochToUTC,
  adaptLocalDateToISOString,
  CHART_AXIS_LABEL_DATE_FORMAT,
  dateToEpoch,
  DOCUMENT_DATE_FORMAT,
  endOf,
  formatDate,
  fromNow,
  getDateByMatchingRegex,
  getDateOrDefaultText,
  getDocumentFormatFromDate,
  getTimeDuration,
  getYear,
  getYearFromNumber,
  isValidDate,
  LONG_DATE_FORMAT,
  longDate,
  now,
  SHORT_DATE_FORMAT,
  shortDate,
  shortDateTime,
  shortDateToDate,
  startOf,
  subtract,
  TIME_AND_DATE_FORMAT,
  toDate,
} from '../date';
import { ISODateRegex } from '../isISODateRegex';

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
      expect(getDateOrDefaultText('2021-04-15T13:31:27.767Z')).toEqual(
        '15.Apr.2021'
      );
      expect(
        getDateOrDefaultText('2021-04-15T13:31:27.767Z', LONG_DATE_FORMAT)
      ).toEqual('15 April, 2021');
      expect(
        getDateOrDefaultText('2021-04-15T13:31:27.767', TIME_AND_DATE_FORMAT)
      ).toEqual('15.Apr.21 01:31:27');
    });

    test('should return short date time', () => {
      expect(shortDateTime('20200101_070314', 'YYYYMMDD_HHmmss')).toEqual(
        '01.Jan.20 07:03:14'
      );
    });

    test('should return formatted date', () => {
      const date = new Date(2000, 1, 12);

      expect(formatDate(date.toISOString(), SHORT_DATE_FORMAT)).toEqual(
        '12.Feb.2000'
      );
      expect(formatDate(date, LONG_DATE_FORMAT)).toEqual('12 February, 2000');
      expect(formatDate(date, TIME_AND_DATE_FORMAT)).toEqual(
        '12.Feb.00 12:00:00'
      );
      expect(
        formatDate(new Date('2021-04-15T13:31:27.767Z'), DOCUMENT_DATE_FORMAT)
      ).toMatch(ISODateRegex);
      expect(formatDate(date, CHART_AXIS_LABEL_DATE_FORMAT)).toEqual(
        'Feb 2000'
      );
    });

    test('should return short date', () => {
      const date = new Date(2000, 1, 12);

      expect(shortDate(date)).toEqual('12.Feb.2000');
      expect(shortDate(date.toISOString())).toEqual('12.Feb.2000');
      expect(shortDate(date.getTime())).toEqual('12.Feb.2000');
    });

    test('should return long date', () => {
      const date = new Date(2000, 1, 12);

      expect(longDate(date)).toEqual('12 February, 2000');
      expect(longDate(date.toISOString())).toEqual('12 February, 2000');
      expect(longDate(date.getTime())).toEqual('12 February, 2000');
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
      describe('adaptLocalEpochToUTC', () => {
        test('should adapt local epoch to local utc', () => {
          const utc = adaptLocalEpochToUTC(0);
          const offset = new Date().getTimezoneOffset();
          expect(utc).toEqual(0 - offset * 60 * 1000);
        });
      });
      describe('adaptLocalDateToISOString', () => {
        test('should adapt local date to iso string', () => {
          const currentDate = new Date();
          const isoString = adaptLocalDateToISOString(currentDate);
          const offset = currentDate.getTimezoneOffset();

          expect(
            new Date(
              dateToEpoch(currentDate) - offset * 60 * 1000
            ).toISOString()
          ).toEqual(isoString);
        });
      });
      describe('isValidDate', () => {
        test('should return correct boolean', () => {
          expect(isValidDate(new Date())).toBeTruthy();
          expect(isValidDate(shortDate(new Date(2020, 11, 21)))).toBeTruthy();
          expect(isValidDate('2021-04-15T13:31:27.767Z')).toBeTruthy();

          // we expect a warning to be thrown by momentjs
          expect(isValidDate('some test date')).toBeFalsy();
        });
      });

      describe('getTimeDuration', () => {
        test('should return time duration as expected', () => {
          expect(getTimeDuration(5000)).toEqual('5s');
          expect(getTimeDuration(17.8, 'days')).toEqual('17d 19h 12m');
          expect(getTimeDuration(45.2, 'days')).toEqual('1M 15d 4h 48m');
          expect(getTimeDuration(25, 'hours')).toEqual('1d 1h');
          expect(getTimeDuration(65, 'minutes')).toEqual('1h 5m');
          expect(getTimeDuration(1425.2, 'days')).toEqual(
            '3Y 10M 1125d 4h 48m'
          );
        });
      });
    });
  });
});
