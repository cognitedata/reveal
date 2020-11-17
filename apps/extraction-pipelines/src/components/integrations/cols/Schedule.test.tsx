import React from 'react';
import { render, screen } from '@testing-library/react';
import Schedule from './Schedule';

describe('<Schedule/>', () => {
  const cases = [
    {
      desc: 'Render On Trigger when scheduled is On Trigger',
      value: 'On Trigger',
      expected: /On Trigger/i,
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
    test(`${desc}`, () => {
      render(<Schedule schedule={value} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });
});
