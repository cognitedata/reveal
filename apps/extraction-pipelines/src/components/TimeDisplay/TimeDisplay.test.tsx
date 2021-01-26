import moment from 'moment';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TimeDisplay } from './TimeDisplay';

describe('TimeDisplay', () => {
  const cases = [
    {
      desc: 'Render time relative time',
      value: 1606822762000, // 2020-12-1
      relative: true,
      expected: moment(1606822762000).fromNow(),
    },
    {
      desc: 'Render absolut time',
      value: 1606822762000, // 2020-12-1
      expected: new RegExp('2020-12-01', 'i'),
    },
  ];
  cases.forEach(({ desc, value, expected, relative }) => {
    test(`${desc}`, () => {
      render(<TimeDisplay value={value} relative={relative} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });
});
