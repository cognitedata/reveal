import { datetimeMultiFormat } from '../dateTime';

describe('DateTimeUtils', () => {
  describe('datetimeMultiFormat', () => {
    it('should format the date using the "millisecond" format', () => {
      const date = new Date('07 Aug 2022 08:35:39.123');
      const result = datetimeMultiFormat(date);
      expect(result).toBe('.123');
    });

    it('should format the date using the "second" format', () => {
      const date = new Date('07 Aug 2022 08:35:39');
      const result = datetimeMultiFormat(date);
      expect(result).toBe(':39');
    });

    it('should format the date using the "minute" format', () => {
      const date = new Date('07 Aug 2022 16:35');
      const result = datetimeMultiFormat(date);
      expect(result).toBe('16:35');
    });

    it('should format the date using the "hour" format', () => {
      const date = new Date('07 Aug 2022 08:00');
      const result = datetimeMultiFormat(date);
      expect(result).toBe('08:00');
    });

    it('should format the date using the "day" format', () => {
      const date = new Date('07 Aug 2022');
      const result = datetimeMultiFormat(date);
      expect(result).toBe('Aug 07');
    });

    it('should format the date using the "week" format', () => {
      const date = new Date('05 Aug 2022');
      const result = datetimeMultiFormat(date);
      expect(result).toBe('Fri 05');
    });

    it('should format the date using the "month" format', () => {
      const date = new Date('01 Aug 2022');
      const result = datetimeMultiFormat(date);
      expect(result).toBe('August');
    });

    it('should format the date using the "year" format', () => {
      const date = new Date('01 Jan 2022');
      const result = datetimeMultiFormat(date);
      expect(result).toBe('2022');
    });
  });
});
