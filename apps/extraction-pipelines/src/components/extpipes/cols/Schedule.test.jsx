import React from 'react';
import { render, screen } from '@testing-library/react';
import Schedule, { SupportedScheduleStrings } from './Schedule';

describe('<Schedule/>', () => {
  const cases = [
    {
      desc: 'Render On Trigger when scheduled is On Trigger',
      value: SupportedScheduleStrings.ON_TRIGGER,
      expected: /On Trigger/i,
    },
    {
      desc: 'Render On Trigger when scheduled is on trigger',
      value: 'on trigger',
      expected: /On Trigger/i,
    },
    {
      desc: 'Render On Trigger when scheduled is oN triGGer',
      value: 'oN triGGer',
      expected: /On Trigger/i,
    },
    {
      desc: 'Render Continuous when scheduled is Continuous',
      value: SupportedScheduleStrings.CONTINUOUS,
      expected: /Continuous/i,
    },
    {
      desc: 'Render Continuous when scheduled is ConTINuous',
      value: 'conTINuous',
      expected: /Continuous/i,
    },
    {
      desc:
        'Render not valid when scheduled is not supported - YouCanNotWriteThis',
      value: 'YouCanNotWriteThis',
      expected: /not valid/i,
    },
    {
      desc: 'Render not valid when scheduled is not supported - * *',
      value: '* *',
      expected: /not valid/i,
    },
    {
      desc: 'Render not valid when scheduled is not supported - 2 0 0 * E',
      value: '2 0 0 * E',
      expected: /not valid/i,
    },
    {
      desc: 'Render Not defined when scheduled is undefined',
      value: undefined,
      expected: /Not defined/i,
    },
    {
      desc: 'Render chron expression when defined',
      value: '0 0 9 1/1 * ? *',
      expected: 'At 09:00 AM',
    },
  ];
  cases.forEach(({ desc, value, expected }) => {
    test.skip(`${desc}`, () => {
      render(<Schedule schedule={value} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });
});
