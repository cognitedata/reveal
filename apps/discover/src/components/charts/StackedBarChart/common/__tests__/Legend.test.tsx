import { screen, fireEvent } from '@testing-library/react';

import { Data, data } from '__test-utils/fixtures/stackedBarChart';
import { testRenderer } from '__test-utils/renderer';

import { LegendProps, ColorConfig } from '../../types';
import { getLegendInitialCheckboxState } from '../../utils';
import { Legend } from '../Legend';

describe('StackedBarChart -> Legend', () => {
  const checkboxState = getLegendInitialCheckboxState<Data>(data, 'label');
  const barColorConfig: ColorConfig = {
    colors: {
      Label1: '#333333',
      Label2: '#595959',
    },
    accessor: 'label',
    defaultColor: '#808080',
  };

  const onChangeCheckbox = jest.fn();

  const defaultProps: LegendProps = {
    checkboxState,
    barColorConfig,
    offsetleft: 0,
    onChange: onChangeCheckbox,
    title: 'Legend Title',
  };

  const testInit = (props: LegendProps = defaultProps) =>
    testRenderer(Legend, undefined, props);

  it('should render legend checkboxes as expected', () => {
    testInit();

    expect(screen.getAllByTestId('legend-checkbox').length).toEqual(2);
    expect(screen.getByText('Label1')).toBeInTheDocument();
    expect(screen.getByText('Label2')).toBeInTheDocument();
  });

  it('should render legend title as expected', () => {
    testInit();
    expect(screen.getByText('Legend Title')).toBeInTheDocument();
  });

  it('should call onChange callback as expected', () => {
    testInit();

    fireEvent.click(screen.getByText('Label1'));
    expect(onChangeCheckbox).toHaveBeenCalledTimes(1);
  });
});
