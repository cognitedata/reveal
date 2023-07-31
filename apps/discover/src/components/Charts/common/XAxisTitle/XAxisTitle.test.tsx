import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { XAxisTitle } from './XAxisTitle';

describe('XAxisTitle', () => {
  const testInit = async (title?: string) =>
    testRenderer(XAxisTitle, undefined, { title });

  it('should not render anything when props are undefined', () => {
    testInit();
    expect(screen.queryByTestId('x-axis-title')).not.toBeInTheDocument();
  });

  it('should render the passed title', () => {
    const title = 'Test Title';

    testInit(title);

    expect(screen.getByTestId('x-axis-title')).toBeInTheDocument();
    expect(screen.getByText(title)).toBeInTheDocument();
  });
});
