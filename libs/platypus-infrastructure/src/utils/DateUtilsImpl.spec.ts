import { DateUtilsImpl } from './DateUtilsImpl';

test('Convert timestamp to string with default format', () => {
  const dateUtils = new DateUtilsImpl();
  expect(dateUtils.parseTimestamp(1636107405779)).toBe('05.11.2021 11:16');
});

test('Convert timestamp to string with custom defined formats', () => {
  const dateUtils = new DateUtilsImpl();
  expect(dateUtils.parseTimestamp(1636107405779, 'yyyy-MM-dd')).toBe(
    '2021-11-05'
  );
  expect(dateUtils.parseTimestamp(1636107405779, 'yyyy-MM-dd hh:mm:ss')).toBe(
    '2021-11-05 11:16:45'
  );
});
