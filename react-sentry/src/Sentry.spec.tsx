import React from 'react';
import { render, screen } from '@testing-library/react';
import { Example } from './Sentry.stories';

describe('Sentry', () => {
  beforeEach(() => {
    // @ts-expect-error - missing other keys
    global.console = { warn: jest.fn() };
  });

  it('renders children', () => {
    render(<Example />);
    expect(screen.getByText('content')).toBeInTheDocument();

    // eslint-disable-next-line no-console
    expect(console.warn).toBeCalled();
  });

  it('accepts dsn as props', () => {
    render(<Example dsn="test" />);
    expect(screen.getByText('content')).toBeInTheDocument();

    // eslint-disable-next-line no-console
    expect(console.warn).not.toBeCalled();
  });
});
