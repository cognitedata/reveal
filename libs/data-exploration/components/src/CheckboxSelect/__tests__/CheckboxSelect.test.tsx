import '@testing-library/jest-dom/extend-expect';

import { screen, fireEvent } from '@testing-library/react';

import { renderComponent } from '@data-exploration-lib/core';

import { CheckboxSelect, CheckboxSelectProps } from '../CheckboxSelect';

jest.mock('@cognite/unified-file-viewer', () => jest.fn());

describe('NestedFilter', () => {
  const onChange = jest.fn();
  const onClickApply = jest.fn();

  const testInit = (extraProps: Partial<CheckboxSelectProps> = {}) => {
    return renderComponent(CheckboxSelect, {
      options: [{ value: 'option1' }, { value: 'option2' }],
      ...extraProps,
    });
  };

  const openFilterMenu = () => {
    fireEvent.click(screen.getByTestId('filter-button'));
  };

  it('should not render apply button', () => {
    testInit({ onClickApply: undefined });
    openFilterMenu();
    expect(screen.queryByTestId('apply-button')).toBeFalsy();
  });

  it('should render apply button', () => {
    testInit({ onClickApply });
    openFilterMenu();
    expect(screen.getByTestId('apply-button')).toBeTruthy();
  });

  it('should call onChange', () => {
    testInit({ onChange });

    openFilterMenu();
    fireEvent.click(screen.getByText('option1'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ option1: [] });
  });

  it('should call onClickApply', () => {
    testInit({ onClickApply });

    openFilterMenu();
    fireEvent.click(screen.getByText('option1'));
    fireEvent.click(screen.getByTestId('apply-button'));

    expect(onClickApply).toHaveBeenCalledTimes(1);
    expect(onClickApply).toHaveBeenCalledWith({ option1: [] });
  });
});
