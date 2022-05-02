import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { MoreOptionsButton } from '../MoreOptionsButton';
import { BaseButtonProps } from '../types';

describe('More Options Button', () => {
  const testInit = async (viewProps?: BaseButtonProps) =>
    testRenderer(MoreOptionsButton, undefined, viewProps);

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
