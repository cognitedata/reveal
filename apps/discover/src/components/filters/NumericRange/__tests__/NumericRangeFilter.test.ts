import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { NumericRangeFilter } from '../NumericRangeFilter';

const values = [0, 100];
const selectedValues = [2, 10];
const onValueChange = jest.fn();

const toId = 'To-';
const fromId = 'From-';

describe('Numeric Range Filter', () => {
  const page = (viewProps?: any) =>
    testRenderer(NumericRangeFilter, undefined, viewProps);

  const defaultTestInit = async (viewProps: any) => {
    return { ...page(viewProps) };
  };

  const defaultProps = {
    values,
    selectedValues: undefined,
    onValueChange,
    config: {
      editableTextFields: true,
    },
  };

  it(`should render the range slider`, async () => {
    await defaultTestInit(defaultProps);

    const row = screen.queryByTestId('empty-range-slider');

    expect(row).not.toBeInTheDocument();
  });

  it(`should show min max values if no value is selected`, async () => {
    await defaultTestInit(defaultProps);
    expect(screen.getByDisplayValue(values[0])).toBeInTheDocument();
    expect(screen.getByDisplayValue(values[1])).toBeInTheDocument();
  });

  it(`should show selected values`, async () => {
    const props = {
      ...defaultProps,
      selectedValues,
    };

    await defaultTestInit(props);
    expect(screen.getByDisplayValue(selectedValues[0])).toBeInTheDocument();
    expect(screen.getByDisplayValue(selectedValues[1])).toBeInTheDocument();
  });

  it(`Input boxes should be editable`, async () => {
    await defaultTestInit(defaultProps);
    expect(screen.getByTestId(toId)).toBeEnabled();
    expect(screen.getByTestId(fromId)).toBeEnabled();
  });

  it(`Input boxes should be readonly`, async () => {
    const props = {
      ...defaultProps,
      config: {
        editableTextFields: false,
      },
    };

    await defaultTestInit(props);
    expect(screen.getByTestId(toId)).toHaveAttribute('readonly');
    expect(screen.getByTestId(fromId)).toHaveAttribute('readonly');
  });

  it(`Should limit input value to minimum value`, async () => {
    const minValue = values[0];

    await defaultTestInit(defaultProps);

    fireEvent.change(screen.getByTestId(fromId), {
      target: { value: minValue - 1 },
    });
    fireEvent.blur(screen.getByTestId(fromId));
    expect(screen.getByTestId(fromId)).toHaveValue(minValue);
  });

  it(`Should limit input value to maximum value`, async () => {
    const maxValue = values[1];

    await defaultTestInit(defaultProps);

    fireEvent.change(screen.getByTestId(toId), {
      target: { value: maxValue + 1 },
    });
    fireEvent.blur(screen.getByTestId(toId));
    expect(screen.getByTestId(toId)).toHaveValue(maxValue);
  });

  it(`Should fire callback on valid input for ${fromId}`, async () => {
    await defaultTestInit(defaultProps);

    fireEvent.change(screen.getByTestId(fromId), { target: { value: 50 } });
    fireEvent.blur(screen.getByTestId(fromId));
    expect(onValueChange).toBeCalledWith([50, 100]);
  });

  it(`Should fire callback on valid input for ${toId}`, async () => {
    await defaultTestInit(defaultProps);

    fireEvent.change(screen.getByTestId(toId), { target: { value: 50 } });
    fireEvent.blur(screen.getByTestId(toId));
    expect(onValueChange).toBeCalledWith([0, 50]);
  });

  it('should render with correct selectedValues on initial render', async () => {
    const props = {
      ...defaultProps,
      selectedValues,
    };

    await defaultTestInit(props);

    expect(screen.getByTestId(fromId)).toHaveValue(selectedValues[0]);
    expect(screen.getByTestId(toId)).toHaveValue(selectedValues[1]);
  });
});
