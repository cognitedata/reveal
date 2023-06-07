import { isDateInDateRange } from '../date';

const TEST_DATE_RANGE: [Date, Date] = [
  new Date('2021-03-07T12:11:17.000Z'),
  new Date('2023-03-07T12:11:17.000Z'),
];

describe('date', () => {
  describe('isDateInDateRange', () => {
    it('should return false if date is out of range', () => {
      const EARLY_DATE = new Date('2020-03-07T12:11:17.000Z');
      expect(isDateInDateRange(EARLY_DATE, TEST_DATE_RANGE)).toBeFalsy();
      const LATE_DATE = new Date('2024-03-07T12:11:17.000Z');
      expect(isDateInDateRange(LATE_DATE, TEST_DATE_RANGE)).toBeFalsy();
    });
    it('should return true if date is in range', () => {
      const START_DATE = new Date('2021-03-07T12:11:17.000Z');
      expect(isDateInDateRange(START_DATE, TEST_DATE_RANGE)).toBeTruthy();
      const END_DATE = new Date('2023-03-07T12:11:17.000Z');
      expect(isDateInDateRange(END_DATE, TEST_DATE_RANGE)).toBeTruthy();
      const BETWEEN_DATE = new Date('2022-03-07T12:11:17.000Z');
      expect(isDateInDateRange(BETWEEN_DATE, TEST_DATE_RANGE)).toBeTruthy();
    });
  });
});
