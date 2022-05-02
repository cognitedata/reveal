import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { HIDE_BUTTON_TEXT } from '../constants';
import { HideButton } from '../HideButton';
import { BaseButtonProps } from '../types';

describe('Hide Button', () => {
  const testInit = async (viewProps?: BaseButtonProps) =>
    testRenderer(HideButton, undefined, viewProps);

  it('should render button as expected', async () => {
    await testInit();

    expect(screen.getByText(HIDE_BUTTON_TEXT)).toBeInTheDocument();
  });

  it('should call `onClick` event once when the button is clicked once', async () => {
    const onClick = jest.fn();
    await testInit({ onClick });

    fireEvent.click(screen.getByText(HIDE_BUTTON_TEXT));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
