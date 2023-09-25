import dayjs from 'dayjs';

import {
  formatDate,
  getLocalDate,
  getTimestamp,
  isDate,
  isValidFDMDate,
} from '../date';

describe('date', () => {
  describe('getTimestamp', () => {
    it('should return the correct timestamp for a valid date', () => {
      // Create a sample date for testing
      const inputDate = new Date('2023-09-15T12:00:00');

      // Calculate the expected timestamp using dayjs
      const expectedTimestamp = dayjs(inputDate).valueOf();

      // Call the function and compare the result with the expected timestamp
      const actualTimestamp = getTimestamp(inputDate);

      expect(actualTimestamp).toEqual(expectedTimestamp);
    });
  });

  describe('getLocalDate', () => {
    it('should return a local date for a valid Date object', () => {
      const inputDate = new Date('2023-09-15T12:00:00Z'); // UTC time

      // Convert to the local date by removing the timezone offset
      const expectedLocalDate = new Date(
        inputDate.getTime() - inputDate.getTimezoneOffset() * 60000
      );

      const actualLocalDate = getLocalDate(inputDate);

      expect(actualLocalDate.toISOString()).toEqual(
        expectedLocalDate.toISOString()
      );
    });

    it('should return a local date for a valid date string', () => {
      const dateString = '2023-09-15T12:00:00Z'; // UTC time

      // Convert to the local date by removing the timezone offset
      const expectedLocalDate = new Date(
        Date.parse(dateString) - new Date().getTimezoneOffset() * 60000
      );

      const actualLocalDate = getLocalDate(dateString);

      expect(actualLocalDate.toISOString()).toEqual(
        expectedLocalDate.toISOString()
      );
    });
  });

  describe('isDate', () => {
    it('should return true for a valid Date object', () => {
      expect(isDate(new Date('2023-09-15T12:00:00Z'))).toBe(true);
      expect(isDate('2023-09-15T12:00:00Z')).toBe(true);
    });

    it('should return false for an invalid Date object', () => {
      const invalidDate = new Date('invalid-date-string');
      expect(isDate(invalidDate)).toBe(false);
    });
  });

  describe('formatDate', () => {
    it('should format a date with the default format', () => {
      const inputDate = new Date('2023-09-15T12:00:00Z');
      const formattedDate = formatDate(inputDate);

      // Use dayjs to format the expected date with the default format
      const expectedFormattedDate =
        dayjs(inputDate).format('DD/MM/YYYY, HH:mm');

      expect(formattedDate).toBe(expectedFormattedDate);
    });

    it('should format a date with a custom format', () => {
      const inputDate = new Date('2023-09-15T12:00:00Z');
      const customFormat = 'YYYY-MM-DD';
      const formattedDate = formatDate(inputDate, customFormat);

      // Use dayjs to format the expected date with the custom format
      const expectedFormattedDate = dayjs(inputDate).format(customFormat);

      expect(formattedDate).toBe(expectedFormattedDate);
    });
  });

  describe('isValidFDMDate', () => {
    it('should return true for a valid ISO date string', () => {
      const validDateStrings = [
        '2023-09-15T12:00:00Z',
        '2023-09-15T12:00:00.123Z',
        '2023-09-15T12:00:00+02:00',
        '2023-09-15T12:00:00-05:00',
      ];

      validDateStrings.forEach((dateString) => {
        expect(isValidFDMDate(dateString)).toBe(true);
      });
    });

    it('should return false for invalid date strings', () => {
      const invalidDateStrings = [
        '2023-09-15 12:00:00Z', // Invalid separator
        '2023/09/15T12:00:00Z', // Invalid date format
        'NotADateString', // Completely invalid
      ];

      invalidDateStrings.forEach((dateString) => {
        expect(isValidFDMDate(dateString)).toBe(false);
      });
    });
  });
});
