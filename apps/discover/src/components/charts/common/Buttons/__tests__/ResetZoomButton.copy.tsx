import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { ResetZoomButton } from '../ResetZoomButton';

describe('ResetZoomButton button', () => {
  const onClick = jest.fn();

  const testInit = async () =>
    testRenderer(ResetZoomButton, undefined, { onClick });

  it('should render button as expected', () => {
    testInit();
    expect(screen.getByTestId('chart-reset-zoom-button')).toBeInTheDocument();
  });

  it('should call `onClick` event once when the button is clicked once', () => {
    testInit();

    fireEvent.click(screen.getByTestId('chart-reset-zoom-button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
