import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { YAxisTitle } from './YAxisTitle';

describe('YAxisTitle', () => {
  const testInit = async (title?: string) =>
    testRenderer(YAxisTitle, undefined, { title });

  it('should not render anything when props are undefined', () => {
    testInit();
    expect(screen.queryByTestId('y-axis-title')).not.toBeInTheDocument();
  });

  it('should render the passed title', () => {
    const title = 'Test Title';

    testInit(title);

    expect(screen.getByTestId('y-axis-title')).toBeInTheDocument();
    expect(screen.getByText(title)).toBeInTheDocument();
  });
});
