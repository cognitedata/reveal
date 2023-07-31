import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import {
  PerformanceMetricsObserver,
  Props,
} from '../PerformanceMetricsObserver';

describe('Performance Metrics Observer', () => {
  const testInit = async (props: Props<JSX.Element>) =>
    testRenderer(PerformanceMetricsObserver, undefined, props);

  const props: Props<JSX.Element> = {
    onChange: jest.fn(),
  };

  it('should render as expected', async () => {
    await testInit(props);
    expect(screen.getByTestId('performance-observer')).toBeInTheDocument();
  });

  it('should maintain original component structure', async () => {
    const firstChild = <h1>Hello world</h1>;
    const view = await testInit({
      children: firstChild,
      onChange: jest.fn(),
    });

    /**
     *
     * Debug
     * const removeLines = /\n/g;
     * const dom = prettyDOM(rendered.container).toString().replace(removeLines, "");
     * */

    // eslint-disable-next-line
    expect(view.container.firstChild).toHaveTextContent('Hello world');
  });
});
