import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { PREVIEW_BUTTON_TEXT } from '../constants';
import { PreviewButton } from '../PreviewButton';
import { BaseButtonProps } from '../types';

describe('Preivew Button', () => {
  const testInit = async (viewProps?: BaseButtonProps) =>
    testRenderer(PreviewButton, undefined, viewProps);

  it('should render button as expected', async () => {
    await testInit();

    expect(screen.getByText(PREVIEW_BUTTON_TEXT)).toBeInTheDocument();
  });

  it('should call `onClick` event once when the button is clicked once', async () => {
    const onClick = jest.fn();
    await testInit({ onClick });

    fireEvent.click(screen.getByText(PREVIEW_BUTTON_TEXT));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
