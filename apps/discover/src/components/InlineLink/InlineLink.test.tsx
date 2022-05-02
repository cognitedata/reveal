import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { Link, Props } from './InlineLink';

const onClick = jest.fn();

const mockPush = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({ push: mockPush }),
}));

const defaultProps = {
  href: 'https://testlink',
  onClick,
};

describe('InlineLink', () => {
  const testInit = async (viewProps?: Props) =>
    testRenderer(Link, undefined, viewProps);

  it('should render inline link button', async () => {
    await testInit(defaultProps);

    expect(screen.getByTestId('link-btn')).toBeInTheDocument();
  });

  it(`should trigger callback on click`, async () => {
    await testInit(defaultProps);
    const button = screen.getByTestId('link-btn');
    fireEvent.click(button);
    expect(onClick).toBeCalledTimes(1);
  });

  it(`should navigate on click`, async () => {
    await testInit({
      href: 'https://testlink',
    });
    const button = screen.getByTestId('link-btn');
    fireEvent.click(button);
    expect(mockPush).toBeCalledTimes(1);
  });
});
