import '@testing-library/jest-dom/extend-expect';

import { screen, fireEvent } from '@testing-library/react';

import { renderComponent } from '@data-exploration-lib/core';

import { SortDirection } from '../../types';
import { SortAction, SortActionProps } from '../SortAction';

describe('NestedFilter/SortAction', () => {
  const onChange = jest.fn();

  const defaultProps: SortActionProps = {
    onChange,
  };

  const testInit = (extraProps: Partial<SortActionProps> = {}) => {
    return renderComponent(SortAction, { ...defaultProps, ...extraProps });
  };

  const clickSortAction = () => {
    return fireEvent.click(screen.getByTestId('sort-action'));
  };

  it('should not render sort action', () => {
    testInit({ isVisible: false });
    expect(screen.queryByTestId('sort-action')).toBeFalsy();
  });

  it('should render sort action', () => {
    testInit();
    expect(screen.getByTestId('sort-action')).toBeTruthy();
  });

  it.skip('should call callback with next sort direction', () => {
    testInit();

    // 1st click - while options are unsorted.
    clickSortAction();
    expect(onChange).toHaveBeenCalledWith(SortDirection.Ascending);

    // 2nd click - while options are sorted in ascending order.
    clickSortAction();
    expect(onChange).toHaveBeenCalledWith(SortDirection.Descending);

    // 3rd click - while options are sorted in descending order.
    clickSortAction();
    expect(onChange).toHaveBeenCalledWith(SortDirection.Descending);

    // 4th click - while options are sorted in ascending order.
    clickSortAction();
    expect(onChange).toHaveBeenCalledWith(SortDirection.Descending);

    expect(onChange).toHaveBeenCalledTimes(4);
  });
});
