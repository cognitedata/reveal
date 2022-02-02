import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';
import { CLEAR_ALL_TEXT } from 'components/tableEmpty/constants';

import { FilterClearAllButton, Props } from '../FilterClearAllButton';

describe('Clear all filters', () => {
  const testInit = async (props: Props) =>
    testRenderer(FilterClearAllButton, undefined, props);

  it('should render button as expected', async () => {
    const onClick = jest.fn();
    await testInit({ onClick });

    expect(screen.getByText(CLEAR_ALL_TEXT)).toBeInTheDocument();
  });

  it('should call `onClick` event once when the button is clicked once', async () => {
    const onClick = jest.fn();
    await testInit({ onClick });

    fireEvent.click(screen.getByText(CLEAR_ALL_TEXT));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
