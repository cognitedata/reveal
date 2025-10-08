import dayjs from 'dayjs';

import { DEFAULT_DATE_TIME_FORMAT } from './constants';
import { formatDateTime, getAbsoluteDateTime, getRelativeDateTime } from './format-date-time';
import { describe, it, expect } from 'vitest';

describe('date/time utils', () => {
  it('formatDateTime returns relative time for past 24 hours', () => {
    const twentyThreeHoursAgo = dayjs().subtract(23, 'hour');
    expect(formatDateTime({ date: twentyThreeHoursAgo })).toBe(
      dayjs(twentyThreeHoursAgo).fromNow()
    );

    const twentyMinutesAgo = dayjs().subtract(20, 'minute');
    expect(formatDateTime({ date: twentyMinutesAgo })).toBe(dayjs(twentyMinutesAgo).fromNow());

    const fewSecondsAgo = dayjs().subtract(10, 'second');
    expect(formatDateTime({ date: fewSecondsAgo })).toBe(dayjs(fewSecondsAgo).fromNow());
  });

  it('formatDateTime returns relative time for future 24 hours', () => {
    const twentyThreeHoursLater = dayjs().add(23, 'hour');
    expect(formatDateTime({ date: twentyThreeHoursLater })).toBe(
      dayjs(twentyThreeHoursLater).fromNow()
    );

    const twentyMinutesLater = dayjs().add(20, 'minute');
    expect(formatDateTime({ date: twentyMinutesLater })).toBe(dayjs(twentyMinutesLater).fromNow());

    const fewSecondsLater = dayjs().add(5, 'second');
    expect(formatDateTime({ date: fewSecondsLater })).toBe(dayjs(fewSecondsLater).fromNow());
  });

  it('formatDateTime returns relative time for past 24 hours in Korean', () => {
    const twentyThreeHoursAgo = dayjs().subtract(23, 'hour');
    expect(formatDateTime({ date: twentyThreeHoursAgo, language: 'ko' })).toBe(
      dayjs(twentyThreeHoursAgo).locale('ko').fromNow()
    );

    const twentyMinutesAgo = dayjs().subtract(20, 'minute');
    expect(formatDateTime({ date: twentyMinutesAgo, language: 'ko' })).toBe(
      dayjs(twentyMinutesAgo).locale('ko').fromNow()
    );

    const fewSecondsAgo = dayjs().subtract(10, 'second');
    expect(formatDateTime({ date: fewSecondsAgo, language: 'ko' })).toBe(
      dayjs(fewSecondsAgo).locale('ko').fromNow()
    );
  });

  it('formatDateTime returns absolute time if showAbsolute argument is true', () => {
    const twentyThreeHoursAgo = dayjs().subtract(23, 'hour');
    expect(formatDateTime({ date: twentyThreeHoursAgo, showAbsolute: true })).toBe(
      dayjs(twentyThreeHoursAgo).format(DEFAULT_DATE_TIME_FORMAT)
    );

    const twentyMinutesAgo = dayjs().subtract(20, 'minute');
    expect(formatDateTime({ date: twentyMinutesAgo, showAbsolute: true })).toBe(
      dayjs(twentyMinutesAgo).format(DEFAULT_DATE_TIME_FORMAT)
    );

    const fewSecondsAgo = dayjs().subtract(10, 'second');
    expect(formatDateTime({ date: fewSecondsAgo, showAbsolute: true })).toBe(
      dayjs(fewSecondsAgo).format(DEFAULT_DATE_TIME_FORMAT)
    );
  });

  it('formatDateTime returns absolute time for more than 48 hours in the past', () => {
    const fortyEightHoursAgo = dayjs().subtract(48, 'hour');
    expect(formatDateTime({ date: fortyEightHoursAgo })).toBe(
      fortyEightHoursAgo.format(DEFAULT_DATE_TIME_FORMAT)
    );

    const twentyMonthsAgo = dayjs().subtract(20, 'month');
    expect(formatDateTime({ date: twentyMonthsAgo })).toBe(
      twentyMonthsAgo.format(DEFAULT_DATE_TIME_FORMAT)
    );

    const tenYearsAgo = dayjs().subtract(10, 'year');
    expect(formatDateTime({ date: tenYearsAgo })).toBe(
      tenYearsAgo.format(DEFAULT_DATE_TIME_FORMAT)
    );
  });

  it('formatDateTime returns absolute time for more than 48 hours in the past with custom format', () => {
    const fortyNineHoursAgo = dayjs().subtract(49, 'hour');
    const customFormat = 'YYYY/MM/DD h:mm A';
    expect(formatDateTime({ date: fortyNineHoursAgo, format: customFormat })).toBe(
      fortyNineHoursAgo.format(customFormat)
    );

    const twentyMonthsAgo = dayjs().subtract(20, 'month');
    expect(formatDateTime({ date: twentyMonthsAgo, format: customFormat })).toBe(
      twentyMonthsAgo.format(customFormat)
    );

    const tenYearsAgo = dayjs().subtract(10, 'year');
    expect(formatDateTime({ date: tenYearsAgo, format: customFormat })).toBe(
      tenYearsAgo.format(customFormat)
    );
  });

  it('formatDateTime returns absolute time for more than 48 hours in the future with custom format', () => {
    const fortyNineHoursLater = dayjs().add(49, 'hour');
    const customFormat = 'DD/MM/YYYY H:mm ';

    expect(formatDateTime({ date: fortyNineHoursLater, format: customFormat })).toBe(
      fortyNineHoursLater.format(customFormat)
    );

    const twentyMonthsLater = dayjs().add(20, 'month');
    expect(formatDateTime({ date: twentyMonthsLater, format: customFormat })).toBe(
      twentyMonthsLater.format(customFormat)
    );

    const fiveYearsLater = dayjs().add(5, 'year');
    expect(formatDateTime({ date: fiveYearsLater, format: customFormat })).toBe(
      fiveYearsLater.format(customFormat)
    );
  });

  it('formatDateTime returns absolute time for more than 48 hours in the past in French', () => {
    const fortyNineHoursAgo = dayjs().subtract(49, 'hour');
    expect(formatDateTime({ date: fortyNineHoursAgo, language: 'fr' })).toBe(
      fortyNineHoursAgo.locale('fr').format('ll LT')
    );

    const twentyMonthsAgo = dayjs().subtract(20, 'month');
    expect(formatDateTime({ date: twentyMonthsAgo, language: 'fr' })).toBe(
      twentyMonthsAgo.locale('fr').format('ll LT')
    );

    const tenYearsAgo = dayjs().subtract(10, 'year');
    expect(formatDateTime({ date: tenYearsAgo, language: 'fr' })).toBe(
      tenYearsAgo.locale('fr').format('ll LT')
    );
  });

  it('formatDateTime returns relative time in the past within the custom 36 hour threshold', () => {
    const thirtyFiveHoursAgo = dayjs().subtract(35, 'hour');
    const thresholdInHours = 36;
    expect(formatDateTime({ date: thirtyFiveHoursAgo, thresholdInHours })).toBe(
      dayjs(thirtyFiveHoursAgo).fromNow()
    );

    const twentyMinutesAgo = dayjs().subtract(20, 'minute');
    expect(formatDateTime({ date: twentyMinutesAgo, thresholdInHours })).toBe(
      dayjs(twentyMinutesAgo).fromNow()
    );

    const fewSecondsAgo = dayjs().subtract(10, 'second');
    expect(formatDateTime({ date: fewSecondsAgo, thresholdInHours })).toBe(
      dayjs(fewSecondsAgo).fromNow()
    );
  });

  it('formatDateTime returns relative time in the future within the custom 36 hour threshold', () => {
    const thirtyFiveHoursLater = dayjs().add(35, 'hour');
    const thresholdInHours = 36;

    expect(formatDateTime({ date: thirtyFiveHoursLater, thresholdInHours })).toBe(
      dayjs(thirtyFiveHoursLater).fromNow()
    );

    const twentyMinutesLater = dayjs().add(20, 'minute');
    expect(formatDateTime({ date: twentyMinutesLater, thresholdInHours })).toBe(
      dayjs(twentyMinutesLater).fromNow()
    );

    const fewSecondsLater = dayjs().add(5, 'second');
    expect(formatDateTime({ date: fewSecondsLater, thresholdInHours })).toBe(
      dayjs(fewSecondsLater).fromNow()
    );
  });

  it('formatDateTime returns absolute time for the past 37 hours with the custom 36 hour threshold', () => {
    const thirtySevenHoursAgo = dayjs().subtract(37, 'hour');
    const customFormat = 'YYYY/MM/DD h:mm A';
    expect(
      formatDateTime({
        date: thirtySevenHoursAgo,
        format: customFormat
      })
    ).toBe(thirtySevenHoursAgo.format(customFormat));

    const twentyMonthsAgo = dayjs().subtract(20, 'month');
    expect(formatDateTime({ date: twentyMonthsAgo, format: customFormat })).toBe(
      twentyMonthsAgo.format(customFormat)
    );

    const tenYearsAgo = dayjs().subtract(10, 'year');
    expect(formatDateTime({ date: tenYearsAgo, format: customFormat })).toBe(
      tenYearsAgo.format(customFormat)
    );
  });

  it('formatDateTime returns relative time for past 36 hours with custom threshold in Korean', () => {
    const thirtyFiveHoursAgo = dayjs().subtract(35, 'hour');
    const thresholdInHours = 36;

    expect(
      formatDateTime({
        date: thirtyFiveHoursAgo,
        language: 'ko',
        thresholdInHours
      })
    ).toBe(dayjs(thirtyFiveHoursAgo).locale('ko').fromNow());

    const twentyMinutesLater = dayjs().subtract(20, 'minute');
    expect(
      formatDateTime({
        date: twentyMinutesLater,
        language: 'ko',
        thresholdInHours
      })
    ).toBe(dayjs(twentyMinutesLater).locale('ko').fromNow());

    const fewSecondsLater = dayjs().subtract(7, 'second');
    expect(
      formatDateTime({
        date: fewSecondsLater,
        language: 'ko',
        thresholdInHours
      })
    ).toBe(dayjs(fewSecondsLater).locale('ko').fromNow());
  });

  it('getRelativeDateTime returns relative time based on RELATIVE_TIME_CONFIG', () => {
    const twentyThreeHoursAgo = dayjs().subtract(23, 'hour');
    expect(getRelativeDateTime({ date: twentyThreeHoursAgo })).toBe(
      dayjs(twentyThreeHoursAgo).fromNow()
    );

    const twentyMinutesAgo = dayjs().subtract(20, 'minute');
    expect(getRelativeDateTime({ date: twentyMinutesAgo })).toBe(dayjs(twentyMinutesAgo).fromNow());

    const fewSecondsAgo = dayjs().subtract(10, 'second');
    expect(getRelativeDateTime({ date: fewSecondsAgo })).toBe(dayjs(fewSecondsAgo).fromNow());

    const twentyThreeHoursLater = dayjs().add(23, 'hour');
    expect(getRelativeDateTime({ date: twentyThreeHoursLater })).toBe(
      dayjs(twentyThreeHoursLater).fromNow()
    );

    const twentyMinutesLater = dayjs().add(20, 'minute');
    expect(getRelativeDateTime({ date: twentyMinutesLater })).toBe(
      dayjs(twentyMinutesLater).fromNow()
    );

    const fewSecondsLater = dayjs().add(5, 'second');
    expect(getRelativeDateTime({ date: fewSecondsLater })).toBe(dayjs(fewSecondsLater).fromNow());

    const fortyEightHoursAgo = dayjs().subtract(48, 'hour');
    expect(getRelativeDateTime({ date: fortyEightHoursAgo })).toBe(
      dayjs(fortyEightHoursAgo).fromNow()
    );

    const twentyMonthsAgo = dayjs().subtract(20, 'month');
    expect(getRelativeDateTime({ date: twentyMonthsAgo })).toBe(dayjs(twentyMonthsAgo).fromNow());

    const tenYearsAgo = dayjs().subtract(10, 'year');
    expect(getRelativeDateTime({ date: tenYearsAgo })).toBe(dayjs(tenYearsAgo).fromNow());

    const fortyEightHoursLater = dayjs().add(48, 'hour');
    expect(getRelativeDateTime({ date: fortyEightHoursLater })).toBe(
      dayjs(fortyEightHoursLater).fromNow()
    );

    const twentyMonthsLater = dayjs().add(20, 'month');
    expect(getRelativeDateTime({ date: twentyMonthsLater })).toBe(
      dayjs(twentyMonthsLater).fromNow()
    );

    const tenYearsLater = dayjs().add(10, 'year');
    expect(getRelativeDateTime({ date: tenYearsLater })).toBe(dayjs(tenYearsLater).fromNow());
  });
  it('getRelativeDateTime returns relative time with given format and language', () => {
    const format = 'YYYY/MM/DD h:mm A';
    const language = 'de';
    const twentyThreeHoursAgo = dayjs().subtract(23, 'hour');
    expect(getRelativeDateTime({ date: twentyThreeHoursAgo, format, language })).toBe(
      dayjs(twentyThreeHoursAgo).locale(language).fromNow()
    );

    const twentyMinutesAgo = dayjs().subtract(20, 'minute');
    expect(getRelativeDateTime({ date: twentyMinutesAgo, format, language })).toBe(
      dayjs(twentyMinutesAgo).locale(language).fromNow()
    );

    const fewSecondsAgo = dayjs().subtract(10, 'second');
    expect(getRelativeDateTime({ date: fewSecondsAgo, format, language })).toBe(
      dayjs(fewSecondsAgo).locale(language).fromNow()
    );

    const twentyThreeHoursLater = dayjs().add(23, 'hour');
    expect(getRelativeDateTime({ date: twentyThreeHoursLater, format, language })).toBe(
      dayjs(twentyThreeHoursLater).locale(language).fromNow()
    );

    const twentyMinutesLater = dayjs().add(20, 'minute');
    expect(getRelativeDateTime({ date: twentyMinutesLater, format, language })).toBe(
      dayjs(twentyMinutesLater).locale(language).fromNow()
    );

    const fewSecondsLater = dayjs().add(5, 'second');
    expect(getRelativeDateTime({ date: fewSecondsLater, format, language })).toBe(
      dayjs(fewSecondsLater).locale(language).fromNow()
    );

    const fortyEightHoursAgo = dayjs().subtract(48, 'hour');
    expect(getRelativeDateTime({ date: fortyEightHoursAgo, format, language })).toBe(
      dayjs(fortyEightHoursAgo).locale(language).fromNow()
    );

    const twentyMonthsAgo = dayjs().subtract(20, 'month');
    expect(getRelativeDateTime({ date: twentyMonthsAgo, format, language })).toBe(
      dayjs(twentyMonthsAgo).locale(language).fromNow()
    );

    const tenYearsAgo = dayjs().subtract(10, 'year');
    expect(getRelativeDateTime({ date: tenYearsAgo, format, language })).toBe(
      dayjs(tenYearsAgo).locale(language).fromNow()
    );

    const fortyEightHoursLater = dayjs().add(48, 'hour');
    expect(getRelativeDateTime({ date: fortyEightHoursLater, format, language })).toBe(
      dayjs(fortyEightHoursLater).locale(language).fromNow()
    );

    const twentyMonthsLater = dayjs().add(20, 'month');
    expect(getRelativeDateTime({ date: twentyMonthsLater, format, language })).toBe(
      dayjs(twentyMonthsLater).locale(language).fromNow()
    );

    const tenYearsLater = dayjs().add(10, 'year');
    expect(getRelativeDateTime({ date: tenYearsLater, format, language })).toBe(
      dayjs(tenYearsLater).locale(language).fromNow()
    );
  });

  it('getAbsoluteDateTime returns absolute time with given format and language', () => {
    const format = 'YYYY/MM/DD h:mm A';
    const language = 'it';
    const twentyThreeHoursAgo = dayjs().subtract(23, 'hour');
    expect(getAbsoluteDateTime({ date: twentyThreeHoursAgo, format, language })).toBe(
      dayjs(twentyThreeHoursAgo).locale(language).format(format)
    );

    const twentyMinutesAgo = dayjs().subtract(20, 'minute');
    expect(getAbsoluteDateTime({ date: twentyMinutesAgo, format, language })).toBe(
      dayjs(twentyMinutesAgo).locale(language).format(format)
    );

    const fewSecondsAgo = dayjs().subtract(10, 'second');
    expect(getAbsoluteDateTime({ date: fewSecondsAgo, format, language })).toBe(
      dayjs(fewSecondsAgo).locale(language).format(format)
    );

    const twentyThreeHoursLater = dayjs().add(23, 'hour');
    expect(getAbsoluteDateTime({ date: twentyThreeHoursLater, format, language })).toBe(
      dayjs(twentyThreeHoursLater).locale(language).format(format)
    );

    const twentyMinutesLater = dayjs().add(20, 'minute');
    expect(getAbsoluteDateTime({ date: twentyMinutesLater, format, language })).toBe(
      dayjs(twentyMinutesLater).locale(language).format(format)
    );

    const fewSecondsLater = dayjs().add(5, 'second');
    expect(getAbsoluteDateTime({ date: fewSecondsLater, format, language })).toBe(
      dayjs(fewSecondsLater).locale(language).format(format)
    );

    const fortyEightHoursAgo = dayjs().subtract(48, 'hour');
    expect(getAbsoluteDateTime({ date: fortyEightHoursAgo, format, language })).toBe(
      dayjs(fortyEightHoursAgo).locale(language).format(format)
    );

    const twentyMonthsAgo = dayjs().subtract(20, 'month');
    expect(getAbsoluteDateTime({ date: twentyMonthsAgo, format, language })).toBe(
      dayjs(twentyMonthsAgo).locale(language).format(format)
    );

    const tenYearsAgo = dayjs().subtract(10, 'year');
    expect(getAbsoluteDateTime({ date: tenYearsAgo, format, language })).toBe(
      dayjs(tenYearsAgo).locale(language).format(format)
    );

    const fortyEightHoursLater = dayjs().add(48, 'hour');
    expect(getAbsoluteDateTime({ date: fortyEightHoursLater, format, language })).toBe(
      dayjs(fortyEightHoursLater).locale(language).format(format)
    );

    const twentyMonthsLater = dayjs().add(20, 'month');
    expect(getAbsoluteDateTime({ date: twentyMonthsLater, format, language })).toBe(
      dayjs(twentyMonthsLater).locale(language).format(format)
    );

    const tenYearsLater = dayjs().add(10, 'year');
    expect(getAbsoluteDateTime({ date: tenYearsLater, format, language })).toBe(
      dayjs(tenYearsLater).locale(language).format(format)
    );
  });
});
