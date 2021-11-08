import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { ZoomOutButton } from '../ZoomOutButton';

describe('ZoomOutButton button', () => {
  const onClick = jest.fn();

  const testInit = async () =>
    testRenderer(ZoomOutButton, undefined, { onClick });

  it('should render button as expected', () => {
    testInit();
    expect(screen.getByTestId('chart-zoom-out-button')).toBeInTheDocument();
  });

  it('should call `onClick` event once when the button is clicked once', () => {
    testInit();

    fireEvent.click(screen.getByTestId('chart-zoom-out-button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
