import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { ZoomInButton } from '../ZoomInButton';

describe('ZoomInButton button', () => {
  const onClick = jest.fn();

  const testInit = async () =>
    testRenderer(ZoomInButton, undefined, { onClick });

  it('should render button as expected', () => {
    testInit();
    expect(screen.getByTestId('chart-zoom-in-button')).toBeInTheDocument();
  });

  it('should call `onClick` event once when the button is clicked once', () => {
    testInit();

    fireEvent.click(screen.getByTestId('chart-zoom-in-button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
