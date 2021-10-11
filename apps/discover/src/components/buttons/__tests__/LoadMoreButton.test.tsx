import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { LOAD_MORE_BUTTON_TEXT } from '../constants';
import { LoadMoreButton } from '../LoadMoreButton';
import { BaseButtonProps } from '../types';

describe('Load More Button', () => {
  const testInit = async (viewProps?: BaseButtonProps) =>
    testRenderer(LoadMoreButton, undefined, viewProps);

  it('should render button as expected', async () => {
    await testInit();

    expect(screen.getByText(LOAD_MORE_BUTTON_TEXT)).toBeInTheDocument();
  });

  it('should call `onClick` event once when the button is clicked once', async () => {
    const onClick = jest.fn();
    await testInit({ onClick });

    fireEvent.click(screen.getByText(LOAD_MORE_BUTTON_TEXT));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
