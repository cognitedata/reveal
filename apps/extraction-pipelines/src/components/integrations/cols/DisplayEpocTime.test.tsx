import { render, screen } from '@testing-library/react';
import moment from 'moment';
import React from 'react';
import DisplayEpocTime from './DisplayEpocTime';

describe('<DisplayEpocTime/>', () => {
  const cases = [
    {
      desc: 'Render time since last run',
      value: 1606480284, // 27.11.2020
      expected: moment.unix(1606480284).fromNow(),
    },
  ];
  cases.forEach(({ desc, value, expected }) => {
    test(`${desc}`, () => {
      render(<DisplayEpocTime time={value} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });

  test('Render nothing when value is 0', () => {
    const { container } = render(<DisplayEpocTime time={0} />);
    expect(container.firstChild).toEqual(null);
  });

  test('Render nothing when value is null', () => {
    const { container } = render(<DisplayEpocTime time={undefined} />);
    expect(container.firstChild).toEqual(null);
  });
});
