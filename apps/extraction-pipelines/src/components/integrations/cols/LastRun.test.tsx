import { render, screen } from '@testing-library/react';
import moment from 'moment';
import React from 'react';
import LastRun from './LastRun';

describe('<LastRun/>', () => {
  const cases = [
    {
      desc: 'Render time since last run',
      value: 1603459877000, // 23.10.2020
      expected: moment(1603459877000).fromNow(),
    },
  ];
  cases.forEach(({ desc, value, expected }) => {
    test(`${desc}`, () => {
      render(
        <LastRun lastUpdatedTime={value} unitOfTime="days" numberOfDays={1} />
      );
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });
});
