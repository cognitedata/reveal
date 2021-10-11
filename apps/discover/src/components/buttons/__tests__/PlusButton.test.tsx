import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { PLUS_BUTTON_TOOLTIP } from '../constants';
import { PlusButton } from '../PlusButton';
import { BaseButtonProps } from '../types';

const BUTTON_TEXT = 'TestButtonText';

describe('Plus Button', () => {
  const testInit = async (viewProps?: BaseButtonProps) =>
    testRenderer(PlusButton, undefined, viewProps);

  it('should render button as expected', async () => {
    await testInit({ text: 'TestButtonText' });

    expect(screen.getByText('TestButtonText')).toBeInTheDocument();
  });

  it('should render the default tooltip', async () => {
    testInit({
      text: 'TestButtonText',
    });

    // Before mouse over on button
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Mouse over on button
    fireEvent.mouseEnter(screen.getByText(BUTTON_TEXT), { bubbles: true });
    await screen.findByRole('tooltip');
    await screen.findByText(PLUS_BUTTON_TOOLTIP);
  });

  it('should call `onClick` event once when the button is clicked once', async () => {
    const onClick = jest.fn();
    await testInit({ text: 'TestButtonText', onClick });

    fireEvent.click(screen.getByText('TestButtonText'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
