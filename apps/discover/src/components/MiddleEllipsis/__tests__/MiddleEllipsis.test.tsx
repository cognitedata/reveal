import { screen, render } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import {
  getMiddleEllipsisWrapper,
  MiddleEllipsis,
  MiddleEllipsisProps,
} from '../MiddleEllipsis';

Object.defineProperties(window.HTMLElement.prototype, {
  offsetWidth: {
    get() {
      return this.tagName === 'DIV' ? 300 : 400;
    },
  },
});

const textContent = 'this is a very long text to read';

describe('Middle ellipsis wrapper', () => {
  it('should return empty fragment when the value is undefined', async () => {
    const { container } = render(getMiddleEllipsisWrapper({}));
    expect(container).toBeEmptyDOMElement();
  });

  it('should not cut texts when fixed length is equal to the text length', () => {
    render(
      getMiddleEllipsisWrapper({ value: textContent }, textContent.length)
    );
    expect(
      screen.getByText(textContent, {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it('should not cut texts when fixed length is greater than the text length', () => {
    render(
      getMiddleEllipsisWrapper({ value: textContent }, textContent.length + 1)
    );
    expect(
      screen.getByText(textContent, {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it('should truncate the text correctly on default cut length', async () => {
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

  it('should truncate the text correctly on given cut length', () => {
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

  it('should handle number input correctly', () => {
    render(getMiddleEllipsisWrapper({ value: 5 as any }));
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});

describe('Middle ellipsis', () => {
  const testInit = (props: MiddleEllipsisProps) => {
    return testRenderer(MiddleEllipsis, undefined, props);
  };

  it('should render middle ellipsis component', async () => {
    testInit({ value: textContent });
    expect(screen.getByTestId('middle-ellipsis')).toBeInTheDocument();
  });
});
