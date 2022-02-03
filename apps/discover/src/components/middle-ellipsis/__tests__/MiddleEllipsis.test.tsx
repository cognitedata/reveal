import { screen, render } from '@testing-library/react';

import { getMiddleEllipsisWrapper } from '../MiddleEllipsis';

Object.defineProperties(window.HTMLElement.prototype, {
  offsetWidth: {
    get() {
      return this.tagName === 'DIV' ? 300 : 400;
    },
  },
});

const textContent = 'this is a very long text to read';

describe('Middle ellipsis wrapper', () => {
  it('truncates the text correctly on default cut length', async () => {
    render(getMiddleEllipsisWrapper({ value: textContent }));
    expect(
      screen.getByText('this is a very long te', {
        exact: false,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText('xt to read', {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it('truncates the text correctly on given cut length', () => {
    render(getMiddleEllipsisWrapper({ value: textContent }, 20));
    expect(
      screen.getByText('this is a ve', {
        exact: true,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText('ry long text to read', {
        exact: true,
      })
    ).toBeInTheDocument();
  });

  it('handles number input correctly', () => {
    render(getMiddleEllipsisWrapper({ value: 5 as any }));
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
