import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { BaseButton } from '../BaseButton';
import { BaseButtonProps } from '../types';

const BUTTON_TEXT = 'TestButtonText';

describe('BaseButton', () => {
  const testInit = async (viewProps?: BaseButtonProps) =>
    testRenderer(BaseButton, undefined, viewProps);

  it('should render button as expected', async () => {
    await testInit({ text: BUTTON_TEXT });

    expect(screen.getByText(BUTTON_TEXT)).toBeInTheDocument();
  });

  it('should not render tooltip when it is not passed into props', async () => {
    await testInit({
      text: BUTTON_TEXT,
    });

    fireEvent.mouseOver(screen.getByText(BUTTON_TEXT), { bubbles: true });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should not render tooltip when an empty string is passed into props as tooltip', async () => {
    const BUTTON__TOOLTIP_TEXT = '';
    await testInit({
      text: BUTTON_TEXT,
      tooltip: BUTTON__TOOLTIP_TEXT,
    });

    // Before mouse over on button
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Mouse over on button
    fireEvent.mouseOver(screen.getByText(BUTTON_TEXT), { bubbles: true });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should render tooltip when it is passed into props', async () => {
    const BUTTON__TOOLTIP_TEXT = 'TestButtonTooltip';
    await testInit({
      text: BUTTON_TEXT,
      tooltip: BUTTON__TOOLTIP_TEXT,
    });

    // Before mouse over on button
    expect(screen.queryByText(BUTTON__TOOLTIP_TEXT)).not.toBeInTheDocument();

    // Mouse over on button
    fireEvent.mouseEnter(screen.getByText(BUTTON_TEXT), { bubbles: true });
    await screen.findByText(BUTTON__TOOLTIP_TEXT);
  });

  it('should render not tooltip when it is not passed into props', async () => {
    await testInit({
      text: BUTTON_TEXT,
    });

    // Before mouse over on button
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Mouse over on button
    fireEvent.mouseOver(screen.getByText(BUTTON_TEXT), { bubbles: true });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should call `onClick` event once when the button is clicked once', async () => {
    const onClick = jest.fn();
    await testInit({ text: BUTTON_TEXT, onClick });

    fireEvent.click(screen.getByText(BUTTON_TEXT));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should not render margin wrapper when margin is false', async () => {
    await testInit({
      margin: false,
      text: BUTTON_TEXT,
      tooltip: 'TestButtonTooltip',
    });

    expect(
      screen.queryByTestId('base-button-margin-wrapper')
    ).not.toBeInTheDocument();
  });
});
