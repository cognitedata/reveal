import '@testing-library/jest-dom/extend-expect';

import { renderComponent } from '@data-exploration-components/__test-utils/renderer';

import { screen, fireEvent } from '@testing-library/react';

import { NestedFilter, NestedFilterProps } from '../NestedFilter';

jest.mock('@cognite/unified-file-viewer', () => jest.fn());

describe('NestedFilter', () => {
  const onChange = jest.fn();
  const onClickApply = jest.fn();

  const testInit = (extraProps: Partial<NestedFilterProps> = {}) => {
    return renderComponent(NestedFilter, {
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
