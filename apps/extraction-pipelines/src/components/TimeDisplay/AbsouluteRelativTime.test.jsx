import React from 'react';
import { screen } from '@testing-library/react';
import moment from 'moment';
import { render } from '../../utils/test';
import { AbsoluteRelativeTime } from './AbsoluteRelativeTime';
import { DATE_FORMAT } from './TimeDisplay';

describe('AbsoluteRelativeTime', () => {
  const noValueMessage = 'No time set';
  test('Should render time on milliseconds', () => {
    const time = new Date();
    const formatted = moment(time).format(DATE_FORMAT);
    render(
      <AbsoluteRelativeTime value={time} noValueMessage={noValueMessage} />
    );
    expect(screen.getByText(new RegExp(formatted, 'i'))).toBeInTheDocument();
  });

  test('Should render time when set in milliseconds', () => {
    const time = 1606822762000;
    render(
      <AbsoluteRelativeTime value={time} noValueMessage={noValueMessage} />
    );
    expect(screen.getByText(new RegExp('2020-12-01', 'i'))).toBeInTheDocument();
  });

  test('Should render nothing when message is not set and time is invalid (0)', () => {
    const time = 0;
    render(<AbsoluteRelativeTime value={time} />);
    expect(screen.queryByText(noValueMessage)).not.toBeInTheDocument();
  });

  test('Should render no value set message when value 0', () => {
    const time = 0;
    render(
      <AbsoluteRelativeTime value={time} noValueMessage={noValueMessage} />
    );
    expect(screen.getByText(noValueMessage)).toBeInTheDocument();
  });

  test('Should render no value set message when value undefined', () => {
    const time = undefined;
    render(
      <AbsoluteRelativeTime value={time} noValueMessage={noValueMessage} />
    );
    expect(screen.getByText(noValueMessage)).toBeInTheDocument();
  });

  test('Should render no value set message when value null', () => {
    const time = null;
    render(
      <AbsoluteRelativeTime value={time} noValueMessage={noValueMessage} />
    );
    expect(screen.getByText(noValueMessage)).toBeInTheDocument();
  });
});
