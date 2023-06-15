import moment from 'moment';
import { screen } from '@testing-library/react';
import { render } from '@extraction-pipelines/utils/test';
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
  test('Render nothing when value is 0', () => {
    render(<TimeDisplay value={0} />);
    expect(screen.queryByText('1970-01-01 01:00:00')).not.toBeInTheDocument();
  });
});
