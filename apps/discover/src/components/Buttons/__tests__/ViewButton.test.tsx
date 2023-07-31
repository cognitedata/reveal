import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { VIEW_BUTTON_TEXT } from '../constants';
import { BaseButtonProps } from '../types';
import { ViewButton } from '../ViewButton';

describe('View Button', () => {
  const testInit = async (viewProps?: BaseButtonProps) =>
    testRenderer(ViewButton, undefined, viewProps);

  it('should render button as expected', async () => {
    await testInit();

    expect(screen.getByText(VIEW_BUTTON_TEXT)).toBeInTheDocument();
  });

  it('should call `onClick` event once when the button is clicked once', async () => {
    const onClick = jest.fn();
    await testInit({ onClick });

    fireEvent.click(screen.getByText(VIEW_BUTTON_TEXT));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
