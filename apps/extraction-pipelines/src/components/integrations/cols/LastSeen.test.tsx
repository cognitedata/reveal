import { render, screen } from '@testing-library/react';
import moment from 'moment';
import React from 'react';
import LastSeen from './LastSeen';

describe('<LastSeen/>', () => {
  const cases = [
    {
      desc: 'Render time since last run',
      value: 1603459877000, // 23.10.2020
      expected: moment(1603459877000).fromNow(),
    },
  ];
  cases.forEach(({ desc, value, expected }) => {
    test(`${desc}`, () => {
      render(<LastSeen lastSeen={value} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });

  test('Render nothing when value is 0', () => {
    const { container } = render(<LastSeen lastSeen={0} />);
    expect(container.firstChild).toEqual(null);
  });

  test('Render nothing when value is null', () => {
    const { container } = render(<LastSeen lastSeen={undefined} />);
    expect(container.firstChild).toEqual(null);
  });
});
