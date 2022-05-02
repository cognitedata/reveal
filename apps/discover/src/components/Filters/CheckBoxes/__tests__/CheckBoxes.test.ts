/* eslint-disable jest/no-conditional-expect */
import { fireEvent, queryHelpers, screen } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';

import { CheckBoxes } from '../CheckBoxes';

const options = ['Composite', 'CPI', 'PPFG', 'Sonic', 'Real Time'];
const objectValues = [
  { text: 'Value 1', key: 'VALUE_1' },
  { text: 'Value 2', key: 'VALUE_2' },
  { text: 'Value 3', key: 'VALUE_3' },
];
const onValueChange = jest.fn();

describe('Check boxes filter', () => {
  const page = (viewProps?: any) =>
    testRendererModal(CheckBoxes, undefined, viewProps);

  const defaultTestInit = async (viewProps: any) => {
    return { ...page(viewProps) };
  };

  it(`should render component with the given values`, async () => {
    const props = {
      options,
      selectedValues: [],
      onValueChange,
    };

    await defaultTestInit(props);
    options.forEach((options) =>
      expect(screen.getByText(options)).toBeInTheDocument()
    );
  });

  it(`should have all checkboxes without checked`, async () => {
    const props = {
      options,
      selectedValues: [],
      onValueChange,
    };

    const { getByCheckbox } = await defaultTestInit(props);
    options.forEach((options) => {
      const checkboxContainer = screen.getByTestId(options);
      const checkbox = getByCheckbox(checkboxContainer);
      expect(checkbox).toHaveProperty('checked', false);
    });
  });

  it(`should checked the check boxes if the values is given as a selected value`, async () => {
    const selectedVals = [options[0], options[1]];
    const props = {
      options,
      selectedValues: selectedVals,
      onValueChange,
    };

    const { getByCheckbox } = await defaultTestInit(props);
    options.forEach((options) => {
      const checkboxContainer = screen.getByTestId(options);
      const checkbox = getByCheckbox(checkboxContainer);
      if (selectedVals.includes(options)) {
        expect(checkbox).toHaveProperty('checked', true);
      } else {
        expect(checkbox).toHaveProperty('checked', false);
      }
    });
  });

  it(`should call the call back when select a value`, async () => {
    const props = {
      options,
      selectedValues: [],
      onValueChange,
    };

    const { getByCheckbox } = await defaultTestInit(props);

    const checkboxContainer = screen.getByTestId(options[0]);
    const checkbox = getByCheckbox(checkboxContainer);
    expect(checkbox).toHaveProperty('checked', false);
    if (checkbox) {
      fireEvent.click(checkbox);
    }
    expect(onValueChange).toBeCalledTimes(1);
  });

  it(`should not show option to select all when 'enableSelectAll' is not provided`, async () => {
    const props = {
      options,
      selectedValues: [],
      onValueChange,
    };

    await defaultTestInit(props);
    expect(screen.queryByText('All')).not.toBeInTheDocument();
  });

  it(`should show option to select all as the first checkbox when 'enableSelectAll' is true`, async () => {
    const props = {
      options,
      selectedValues: [],
      onValueChange,
      enableSelectAll: true,
    };

    await defaultTestInit(props);
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it(`should automatically check 'All' when all options are passed as selected`, async () => {
    const props = {
      options,
      selectedValues: options,
      onValueChange,
      enableSelectAll: true,
    };

    const { getByCheckbox } = await defaultTestInit(props);

    const checkboxContainer = screen.getByTestId('All');
    const checkbox = getByCheckbox(checkboxContainer);
    expect(checkbox).toHaveProperty('checked', true);
  });

  it(`should automatically uncheck 'All' when all options are not selected`, async () => {
    const props = {
      options,
      selectedValues: [],
      onValueChange,
      enableSelectAll: true,
    };

    const { getByCheckbox } = await defaultTestInit(props);

    const checkboxContainer = screen.getByTestId('All');
    const checkbox = getByCheckbox(checkboxContainer);
    expect(checkbox).toHaveProperty('checked', false);
  });

  it(`should automatically uncheck 'All' when any option is not selected`, async () => {
    const props = {
      options,
      selectedValues: options.shift(),
      onValueChange,
      enableSelectAll: true,
    };

    const { getByCheckbox } = await defaultTestInit(props);

    const checkboxContainer = screen.getByTestId('All');
    const checkbox = getByCheckbox(checkboxContainer);
    expect(checkbox).toHaveProperty('checked', false);
  });

  it(`should return all values to the callback when checking select all`, async () => {
    const props = {
      options,
      selectedValues: [],
      onValueChange,
      enableSelectAll: true,
    };

    const { getByCheckbox } = await defaultTestInit(props);

    const checkboxContainer = screen.getByTestId('All');
    const checkbox = getByCheckbox(checkboxContainer);
    if (checkbox) {
      fireEvent.click(checkbox);
    }
    expect(onValueChange).toHaveBeenCalledWith(options);
  });

  it(`should return an empty array [] to the callback when unchecking select all`, async () => {
    const props = {
      options,
      selectedValues: options,
      onValueChange,
      enableSelectAll: true,
    };

    const { getByCheckbox } = await defaultTestInit(props);

    const checkboxContainer = screen.getByTestId('All');
    const checkbox = getByCheckbox(checkboxContainer);
    if (checkbox) {
      fireEvent.click(checkbox);
    }
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it(`OBJECT array: should render component with the given object values`, async () => {
    const props = {
      options: objectValues,
      selectedValues: objectValues.map((option) => option.key),
      onValueChange,
    };

    const { getByCheckbox } = await defaultTestInit(props);
    objectValues.forEach((object) =>
      expect(screen.getByText(object.text)).toBeInTheDocument()
    );
    objectValues.forEach((options) => {
      const checkboxContainer = screen.getByTestId(options.key);
      const checkbox = getByCheckbox(checkboxContainer);
      expect(checkbox).toHaveProperty('checked', true);
    });
    expect(screen.queryByText('All')).not.toBeInTheDocument();
  });

  it(`OBJECT array: should render component with the given object values with select all`, async () => {
    const props = {
      options: objectValues,
      selectedValues: objectValues.map((option) => option.key),
      onValueChange,
      enableSelectAll: true,
    };

    const { getByCheckbox } = await defaultTestInit(props);
    objectValues.forEach((object) =>
      expect(screen.getByText(object.text)).toBeInTheDocument()
    );
    objectValues.forEach((options) => {
      const checkboxContainer = screen.getByTestId(options.key);
      const checkbox = queryHelpers.queryByAttribute(
        'type',
        checkboxContainer,
        'checkbox'
      );
      expect(checkbox).toHaveProperty('checked', true);
    });

    const allCheckboxContainer = screen.getByTestId('All');
    const allCheckboxs = getByCheckbox(allCheckboxContainer);

    expect(allCheckboxs).toBeInTheDocument();
    expect(allCheckboxs).toHaveProperty('checked', true);
  });

  it(`OBJECT array: should call the call back when select a value`, async () => {
    const mock = jest.fn();
    const props = {
      options: objectValues,
      selectedValues: [],
      onValueChange: mock,
    };

    const { getByCheckbox } = await defaultTestInit(props);

    const checkboxContainer = screen.getByTestId(objectValues[0].key);
    const checkbox = getByCheckbox(checkboxContainer);

    expect(checkbox).toBeTruthy();
    if (checkbox) {
      fireEvent.click(checkbox);
    }
    expect(mock).lastCalledWith([objectValues[0].key]);
  });
});
