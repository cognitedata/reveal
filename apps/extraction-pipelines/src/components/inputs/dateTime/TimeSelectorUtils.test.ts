import {
  createDateFromTimeChange,
  createDateWithTime,
  createHalfHourOptions,
  optionTimeField,
  parseTimeString,
  rangeToTwoDigitString,
} from 'components/inputs/dateTime/TimeSelectorUtils';

describe('TimeSelectorUtils', () => {
  test('createHalfHourOptions', () => {
    const res = createHalfHourOptions();
    expect(res[0].label).toEqual('00:00');
    expect(res[0].value.hours).toEqual(0);
    expect(res[0].value.min).toEqual(0);
    expect(res[1].label).toEqual('00:30');
    expect(res[1].value.hours).toEqual(0);
    expect(res[1].value.min).toEqual(30);
  });

  test('optionTimeField - match on hours and minutes', () => {
    const range = {
      startDate: new Date(2021, 5, 1, 10, 0),
      endDate: new Date(),
    };
    const fn = optionTimeField(range, 'startDate');
    const res = fn({ label: '', value: { hours: 10, min: 0 } });
    expect(res).toEqual(true);

    const res2 = fn({ label: '', value: { hours: 10, min: 30 } });
    expect(res2).toEqual(false);

    const res3 = fn({ label: '', value: { hours: 11, min: 0 } });
    expect(res3).toEqual(false);
  });

  test('createDateWithTime', () => {
    const year = 2021;
    const month = 5;
    const day = 1;
    const date = {
      startDate: new Date(year, month, day),
      endDate: new Date(2021, 5, 3),
    };
    const hours = 2;
    const min = 3;
    const time = {
      startDate: new Date(2021, 5, 1, hours, min),
      endDate: new Date(2021, 5, 3, 3, 5),
    };
    const res = createDateWithTime(date, time, 'startDate');
    expect(res.getFullYear()).toEqual(year);
    expect(res.getMonth()).toEqual(month);
    expect(res.getDate()).toEqual(day);
    expect(res.getMinutes()).toEqual(min);
    expect(res.getHours()).toEqual(hours);
  });

  test('createDateFromTimeChange', () => {
    const year = 2021;
    const month = 5;
    const day = 1;
    const date = {
      startDate: new Date(year, month, day),
      endDate: new Date(2021, 5, 3),
    };
    const hours = 2;
    const min = 3;
    const time = {
      hours,
      min,
    };
    const res = createDateFromTimeChange(date, 'startDate', time);
    expect(res.getFullYear()).toEqual(year);
    expect(res.getMonth()).toEqual(month);
    expect(res.getDate()).toEqual(day);
    expect(res.getMinutes()).toEqual(min);
    expect(res.getHours()).toEqual(hours);
  });

  describe('parseTimeString', () => {
    const cases = [
      { input: '23:09', expected: { min: 9, hours: 23 } },
      { input: '10:00', expected: { min: 0, hours: 10 } },
      { input: '08:54', expected: { min: 54, hours: 8 } },
      { input: '67:99', expected: undefined },
      { input: 'absd', expected: undefined },
    ];
    cases.forEach(({ input, expected }) => {
      test(`Parses string ${input} to time`, () => {
        const res = parseTimeString(input);
        expect(res).toEqual(expected);
      });
    });
  });

  describe('rangeToTwoDigitString', () => {
    const cases = [
      { values: { hours: 2, min: 2 }, expected: '02:02' },
      { values: { hours: 0, min: 0 }, expected: '00:00' },
      { values: { hours: 20, min: 45 }, expected: '20:45' },
    ];
    cases.forEach(({ values, expected }) => {
      test(`Converts hours: ${values.hours}, min: ${values.min} to two digit string: ${expected}`, () => {
        const res = rangeToTwoDigitString(values);
        expect(res).toEqual(expected);
      });
    });
  });
});
