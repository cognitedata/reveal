import { render, screen } from '@testing-library/react';
import moment from 'moment';
import React from 'react';
import LatestRun from './LatestRun';

describe('<LatestRun/>', () => {
  const cases = [
    {
      desc: 'Render time since last run',
      value: moment(1603459877000), // 23.10.2020
      expected: moment(1603459877000).fromNow(),
    },
  ];
  cases.forEach(({ desc, value, expected }) => {
    test(`${desc}`, () => {
      render(<LatestRun latestRunTime={value} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });

  test('Render nothing when value is null', () => {
    const { container } = render(<LatestRun latestRunTime={null} />);
    expect(container.firstChild).toEqual(null);
  });
});
