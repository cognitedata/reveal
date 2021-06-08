import { render, screen } from '@testing-library/react';

import { ConditionalSentry } from '../Sentry';

describe('Sentry', () => {
  it('should render conditionally', () => {
    // @ts-expect-error - missing other keys
    global.console = { warn: jest.fn(), log: jest.fn() };

    const Test = () => (
      <ConditionalSentry disabled={false}>
        <div>test-content</div>
      </ConditionalSentry>
    );

    render(<Test />);

    expect(screen.getByText('test-content')).toBeInTheDocument();

    // eslint-disable-next-line no-console
    expect(console.warn).toBeCalledWith(
      'Sentry DSN not found. Not initializing Sentry.'
    );
  });

  it('should not render conditionally', () => {
    // @ts-expect-error - missing other keys
    global.console = { warn: jest.fn(), log: jest.fn() };

    const Test = () => (
      <ConditionalSentry disabled>
        <div>test-content</div>
      </ConditionalSentry>
    );

    render(<Test />);

    expect(screen.getByText('test-content')).toBeInTheDocument();

    // eslint-disable-next-line no-console
    expect(console.warn).toBeCalledTimes(0);
  });
});
