import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { ReorderButton } from '../ReorderButton';
import { BaseButtonProps } from '../types';

describe('Reorder Default Button', () => {
  const testInit = async (viewProps?: BaseButtonProps) =>
    testRenderer(ReorderButton.Default, undefined, viewProps);

  it('should render button as expected', async () => {
    await testInit({ text: 'TestButtonText' });

    expect(screen.getByText('TestButtonText')).toBeInTheDocument();
  });

  it('should call `onClick` event once when the button is clicked once', async () => {
    const onClick = jest.fn();
    await testInit({ text: 'TestButtonText', onClick });

    fireEvent.click(screen.getByText('TestButtonText'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
