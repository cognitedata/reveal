export const getFormattedTimezone = (date: Date) => {
  const offset = date.getTimezoneOffset();

  const sign = offset < 0 ? '+' : '-';

  const offsetValue = Math.abs(offset);
  const offsetHours = String((offsetValue / 60) | 0).padStart(2, '0');
  const offsetMinutes = String(offsetValue % 60).padStart(2, '0');

  const formattedOffsetValue = `${offsetHours}:${offsetMinutes}`;

  return `GMT(${sign}${formattedOffsetValue})`;
};
