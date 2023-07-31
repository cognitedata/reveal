import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { NumberInput } from '../NumberInput';
import { NumberInputProps } from '../types';

describe('NumberInput', () => {
  const [min, max] = [10, 20];
  const onChange = jest.fn();

  const defaultProps: NumberInputProps = {
    range: [min, max],
    value: 0,
    onChange,
  };

  const testInit = (props: NumberInputProps = defaultProps) =>
    testRenderer(NumberInput, undefined, props);

  it('should call `onChange` as expected', () => {
    testInit();
    const input = screen.getByTestId('number-input');

    fireEvent.change(input, { target: { value: 5 } });
    expect(onChange).toHaveBeenCalledWith(min);

    fireEvent.change(input, { target: { value: 25 } });
    expect(onChange).toHaveBeenCalledWith(max);

    fireEvent.change(input, { target: { value: 15 } });
    expect(onChange).toHaveBeenCalledWith(15);
  });

  it('should call `onChange` with `0` when input is empty', () => {
    testInit();
    const input = screen.getByTestId('number-input');

    fireEvent.change(input, { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith(0);
  });
});
