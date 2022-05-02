import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { BackButton } from '../BackButton';
import { BACK_BUTTON_TOOLTIP } from '../constants';
import { BaseButtonProps } from '../types';

const BUTTON_TEXT = 'TestButtonText';

describe('Back Button', () => {
  const testInit = async (viewProps?: BaseButtonProps) =>
    testRenderer(BackButton, undefined, viewProps);

  it('should render button as expected', async () => {
    await testInit({ text: BUTTON_TEXT });

    expect(screen.getByText(BUTTON_TEXT)).toBeInTheDocument();
  });

  it('should render the default tooltip', async () => {
    await testInit({
      text: BUTTON_TEXT,
    });

    expect(screen.getByText(BUTTON_TEXT)).toBeInTheDocument();
    // Before mouse over on button
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Mouse over on button
    fireEvent.mouseEnter(screen.getByText(BUTTON_TEXT), { bubbles: true });

    await screen.findByRole('tooltip');
    await screen.findByText(BACK_BUTTON_TOOLTIP);
  });

  // -it('should render the default icon', async () => {
  //   const { container } = await testInit({
  //     text: BUTTON_TEXT,
  //   });

  //   expect(
  //     container.getElementsByClassName(`${COGS_ICON_CLASS_PREFIX}-ArrowLeft`)
  //       .length
  //   ).toBeGreaterThan(0);
  // });

  it('should call `onClick` event once when the button is clicked once', async () => {
    const onClick = jest.fn();
    await testInit({ text: BUTTON_TEXT, onClick });

    fireEvent.click(screen.getByText(BUTTON_TEXT));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
