import '@testing-library/jest-dom/extend-expect';

import { screen, fireEvent } from '@testing-library/react';
import { renderComponent } from '../../../__test-utils';

import { SearchInput, SearchInputProps } from '../SearchInput';

describe('NestedFilter/SearchInput', () => {
  const onChange = jest.fn();

  const defaultProps: SearchInputProps = {
    onChange,
  };

  const testInit = (extraProps: Partial<SearchInputProps> = {}) => {
    return renderComponent(SearchInput, { ...defaultProps, ...extraProps });
  };

  it('should render search input', () => {
    testInit();
    expect(screen.getByTestId('search-input')).toBeTruthy();
  });

  it('should call callback function with search input value', () => {
    testInit();

    const value = 'Test';
    fireEvent.change(screen.getByTestId('search-input'), { target: { value } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(value);
  });
});
