import { render, screen } from '@testing-library/react';
import moment from 'moment';
import React from 'react';
import RelativeTimeWithTooltip from './RelativeTimeWithTooltip';

describe('<RelativeTimeWithTooltip/>', () => {
  const cases = [
    {
      desc: 'Render time since last run',
      value: 1606822762000, // 2020-12-1
      expected: moment(1606822762000).fromNow(),
    },
  ];
  cases.forEach(({ desc, value, expected }) => {
    test(`${desc}`, () => {
      render(<RelativeTimeWithTooltip time={value} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });

  test('Render nothing when value is 0', () => {
    const { container } = render(<RelativeTimeWithTooltip time={0} />);
    expect(container.firstChild).toEqual(null);
  });

  test('Render nothing when value is null', () => {
    const { container } = render(<RelativeTimeWithTooltip time={undefined} />);
    expect(container.firstChild).toEqual(null);
  });
});
