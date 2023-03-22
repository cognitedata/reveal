import '@testing-library/jest-dom/extend-expect';

import { screen } from '@testing-library/react';

import { Option, OptionProps } from '../Option';
import { OptionType } from '../../types';
import { renderComponent } from '../../../__test-utils';

describe('NestedFilter/Option', () => {
  const option: OptionType = {
    value: 'test',
  };

  const onChange = jest.fn();

  const defaultProps: OptionProps = {
    option,
    onChange,
  };

  const testInit = (extraProps: Partial<OptionProps> = {}) => {
    return renderComponent(Option, { ...defaultProps, ...extraProps });
  };

  it('should render option', () => {
    testInit();
    expect(screen.getByTestId('option')).toBeTruthy();
  });

  it('should show option label if exists', () => {
    testInit({ option: { label: 'label', value: 'value' } });
    expect(screen.getByText('label')).toBeTruthy();
  });

  it('should show option value as label if label does not exist', () => {
    testInit({ option: { value: 'value' } });
    expect(screen.getByText('value')).toBeTruthy();
  });

  it('should show available child options count if any', () => {
    // If child options are undefined.
    testInit({
      option: {
        ...option,
        options: undefined,
      },
    });
    expect(screen.queryByTestId('option-secondary-label')).toBeFalsy();

    // If child options are empty.
    testInit({
      option: {
        ...option,
        options: [],
      },
    });
    expect(screen.queryByTestId('option-secondary-label')).toBeFalsy();

    testInit({
      option: {
        ...option,
        options: [option, option],
      },
    });
    expect(screen.getByTestId('option-secondary-label')).toBeTruthy();
    expect(screen.getByText('Values: 2')).toBeTruthy();
  });

  it('should show count properly', () => {
    testInit({
      option: {
        ...option,
        count: undefined,
      },
    });
    expect(screen.queryByTestId('count')).toBeFalsy();

    const testAvailableResultsCountDisplay = (
      count: number,
      expectedLabel: string
    ) => {
      testInit({
        option: {
          ...option,
          count,
        },
      });
      expect(screen.getByText(expectedLabel)).toBeTruthy();
    };

    testAvailableResultsCountDisplay(0, '0');
    testAvailableResultsCountDisplay(10, '10');
    testAvailableResultsCountDisplay(405001, '405K+');
  });

  it('should show child options icon conditionally', () => {
    testInit({ hasOptionWithChildOptions: false });
    expect(screen.queryByTestId('child-options-icon')).toBeFalsy();

    testInit({ hasOptionWithChildOptions: true });
    expect(screen.getByTestId('child-options-icon')).toBeTruthy();
  });
});
