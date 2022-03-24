import { DateFormat } from '@platypus/platypus-core';
import { DateUtilsImpl } from './date-utils-impl';

describe('DateUtilsTest', () => {
  it('Should add days to a date', () => {
    const dateUtils = new DateUtilsImpl();
    expect(dateUtils.addDays(1636107405779, 1).getTime()).toBe(1636193805779);

    const date = new Date(1636107405779);
    date.setDate(15);
    expect(dateUtils.addDays(date, 1).getDate()).toBe(16);
  });

  it('Should parse date', () => {
    const dateUtils = new DateUtilsImpl();

    expect(dateUtils.parse('2021-09-11')).toEqual(new Date('2021-09-11 00:00'));
    expect(
      dateUtils.parse('18.12.2021', DateFormat.DISPLAY_DATE_FORMAT)
    ).toEqual(new Date('2021-12-18 00:00'));
    expect(dateUtils.parse('18.12.2021', 'dd.MM.yyyy')).toEqual(
      new Date('2021-12-18 00:00')
    );
  });

  it('can convert date string from custom date format', () => {
    const date = new Date('2019-12-18 00:00');
    const dateUtils = new DateUtilsImpl();
    expect(dateUtils.format(date)).toEqual('18.12.2019');
    expect(dateUtils.format(date, 'MM/dd/yyyy')).toEqual('12/18/2019');
    expect(dateUtils.format(date, 'MM/DD/YYYY')).toEqual('12/18/2019');
    expect(dateUtils.format(date, DateFormat.SERVER_DATE_FORMAT)).toEqual(
      '2019-12-18'
    );
  });

  test('Convert timestamp to string with default format', () => {
    const dateUtils = new DateUtilsImpl();
    expect(dateUtils.format(1636107405779)).toBe('05.11.2021');
  });

  test('Convert timestamp to string with custom defined formats', () => {
    const dateUtils = new DateUtilsImpl();
    expect(dateUtils.format(1636107405779, 'yyyy-MM-dd')).toBe('2021-11-05');
  });
});
