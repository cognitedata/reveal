import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { MINUS_BUTTON_TOOLTIP } from '../constants';
import { MinusButton } from '../MinusButton';
import { BaseButtonProps } from '../types';

const BUTTON_TEXT = 'TestButtonText';

describe('Minus Button', () => {
  const testInit = async (viewProps?: BaseButtonProps) =>
    testRenderer(MinusButton, undefined, viewProps);

  it('should render button as expected', async () => {
    await testInit({ text: BUTTON_TEXT });

    expect(screen.getByText(BUTTON_TEXT)).toBeInTheDocument();
  });

  it('should render the default tooltip', async () => {
    await testInit({
      text: BUTTON_TEXT,
    });

    // Before mouse over on button
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Mouse over on button
    fireEvent.mouseEnter(screen.getByText(BUTTON_TEXT), { bubbles: true });
    await screen.findByRole('tooltip');
    await screen.findByText(MINUS_BUTTON_TOOLTIP);
  });

  it('should call `onClick` event once when the button is clicked once', async () => {
    const onClick = jest.fn();
    await testInit({ text: BUTTON_TEXT, onClick });

    fireEvent.click(screen.getByText(BUTTON_TEXT));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
