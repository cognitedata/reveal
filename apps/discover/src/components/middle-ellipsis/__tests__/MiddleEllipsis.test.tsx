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
  it('check for middle ellipsis', async () => {
    render(getMiddleEllipsisWrapper(textContent, false));
    expect(
      screen.getByText('this is a ', {
        exact: false,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText('...', {
        exact: false,
      })
    ).toBeInTheDocument();
  });
});
