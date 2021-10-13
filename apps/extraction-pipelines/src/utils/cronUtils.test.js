import { SupportedScheduleStrings } from 'components/integrations/cols/Schedule';
import {
  mapModelToInput,
  mapScheduleInputToScheduleValue,
  parseCron,
} from './cronUtils';

describe('Cron Utils', () => {
  const cases = [
    {
      value: '0 0 9 1/1 * ? *',
      expected: 'At 09:00 AM',
    },
    { value: '0 0 9 * *', expected: 'At 12:00 AM, on day 9 of the month' },
    { value: '15 15 * * *', expected: 'At 03:15 PM' },
    { value: '43 15 * * 1', expected: 'At 03:43 PM, only on Monday' },
    { value: '34 4 11 * *', expected: 'At 04:34 AM, on day 11 of the month' },
    {
      value: '34 4 * 10 5',
      expected: 'At 04:34 AM, only on Friday, only in October',
    },
  ];
  cases.forEach(({ value, expected }) => {
    test(`Should parse ${value} to ${expected}`, () => {
      const res = parseCron(value);
      expect(res).toEqual(expected);
    });
  });
  const mapCases = [
    {
      desc: 'not defined to undefined',
      field: {
        schedule: SupportedScheduleStrings.NOT_DEFINED,
      },
      expected: '',
    },
    {
      desc: 'scheduled cron to cron',
      field: {
        schedule: SupportedScheduleStrings.SCHEDULED,
        cron: '15 15 * * *',
      },
      expected: '15 15 * * *',
    },
    {
      desc: 'on trigger cron to on trigger',
      field: {
        schedule: SupportedScheduleStrings.ON_TRIGGER,
        cron: '15 15 * * *',
      },
      expected: SupportedScheduleStrings.ON_TRIGGER,
    },
    {
      desc: 'Continuous cron to Continuous',
      field: {
        schedule: SupportedScheduleStrings.CONTINUOUS,
        cron: '15 15 * * *',
      },
      expected: SupportedScheduleStrings.CONTINUOUS,
    },
    {
      desc: 'Something else cron to undefined',
      field: {
        schedule: 'what ever',
        cron: '15 15 * * *',
      },
      expected: undefined,
    },
  ];
  mapCases.forEach(({ desc, field, expected }) => {
    test(`mapScheduleInputToModel - ${desc}`, () => {
      const res = mapScheduleInputToScheduleValue(field);
      expect(res).toEqual(expected);
    });
  });

  const modelToInput = [
    {
      desc: 'undefined to empty string (not set)',
      model: undefined,
      expected: {
        schedule: '',
        cron: '',
      },
    },
    {
      desc: 'On trigger to On trigger',
      model: SupportedScheduleStrings.ON_TRIGGER,
      expected: {
        schedule: SupportedScheduleStrings.ON_TRIGGER,
        cron: '',
      },
    },
    {
      desc: 'CONTINUOUS to CONTINUOUS',
      model: SupportedScheduleStrings.CONTINUOUS,
      expected: {
        schedule: SupportedScheduleStrings.CONTINUOUS,
        cron: '',
      },
    },
    {
      desc: 'cron to scheduled cron',
      model: '15 15 * * *',
      expected: {
        schedule: SupportedScheduleStrings.SCHEDULED,
        cron: '15 15 * * *',
      },
    },
  ];

  modelToInput.forEach(({ desc, model, expected }) => {
    test(`mapModelToInput - ${desc}`, () => {
      const res = mapModelToInput(model);
      expect(res).toEqual(expected);
    });
  });
});
