import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { SHARE_BUTTON_TOOLTIP } from '../constants';
import { ShareButton } from '../ShareButton';
import { BaseButtonProps } from '../types';

const BUTTON_TEXT = 'TestButtonText';

describe('Share Button', () => {
  const testInit = async (viewProps?: BaseButtonProps) =>
    testRenderer(ShareButton, undefined, viewProps);

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
    await screen.findByText(SHARE_BUTTON_TOOLTIP);
  });

  it('should call `onClick` event once when the button is clicked once', async () => {
    const onClick = jest.fn();
    await testInit({ text: BUTTON_TEXT, onClick });

    fireEvent.click(screen.getByText(BUTTON_TEXT));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
