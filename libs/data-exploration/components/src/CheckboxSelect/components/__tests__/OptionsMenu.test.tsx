import '@testing-library/jest-dom/extend-expect';

import { screen, fireEvent } from '@testing-library/react';

import { renderComponent } from '@data-exploration-lib/core';

import { OptionsMenu, OptionsMenuProps } from '../OptionsMenu';

jest.mock('@cognite/unified-file-viewer', () => jest.fn());

describe('NestedFilter/OptionsMenu', () => {
  const onChange = jest.fn();

  const defaultProps: OptionsMenuProps = {
    options: [{ value: 'option1' }, { value: 'option2' }],
    selection: {},
    onChange,
  };

  const testInit = (extraProps: Partial<OptionsMenuProps> = {}) => {
    return renderComponent(OptionsMenu, { ...defaultProps, ...extraProps });
  };

  it('should render correct number of options', () => {
    testInit();
    expect(screen.getAllByTestId('option')).toHaveLength(2);
  });

  it('should call callback', () => {
    testInit();
    fireEvent.click(screen.getByText('option1'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ option1: [] });
  });

  it('should show filtered options', () => {
    testInit();
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: '1' },
    });
    expect(screen.getAllByTestId('option')).toHaveLength(1);
  });

  it('should show empty state if no options to display', () => {
    testInit();
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'no-results' },
    });
    expect(screen.queryByTestId('option')).toBeFalsy();
    expect(screen.getByText('No options')).toBeTruthy();
  });

  it('should show sort action conditionally', () => {
    testInit({ enableSorting: true });
    expect(screen.getByTestId('sort-action')).toBeTruthy();
  });

  it('should render footer', () => {
    testInit({ footer: <div data-testid="footer">Footer</div> });
    expect(screen.getByTestId('footer')).toBeTruthy();
  });
});
