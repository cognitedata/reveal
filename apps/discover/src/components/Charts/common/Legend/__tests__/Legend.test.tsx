import { screen, fireEvent } from '@testing-library/react';

import { Data, data, yAccessor } from '__test-utils/fixtures/charts';
import { testRenderer } from '__test-utils/renderer';
import { ColorConfig } from 'components/Charts/types';

import { Legend } from '../Legend';
import { LegendProps } from '../types';
import { getLegendInitialCheckboxState } from '../utils';

describe('Charts -> Legend', () => {
  const legendCheckboxState = getLegendInitialCheckboxState<Data>(
    data,
    yAccessor
  );
  const colorConfig: ColorConfig = {
    colors: {
      Label1: '#333333',
      Label2: '#595959',
    },
    accessor: yAccessor,
    defaultColor: '#808080',
  };

  const onChangeLegendCheckbox = jest.fn();

  const defaultProps: LegendProps = {
    legendCheckboxState,
    colorConfig,
    onChangeLegendCheckbox,
    legendOptions: {
      title: 'Legend Title',
    },
  };

  const testInit = (props: LegendProps = defaultProps) =>
    testRenderer(Legend, undefined, props);

  it('should render legend checkboxes as expected', () => {
    testInit();

    expect(screen.getAllByTestId('CheckIcon').length).toEqual(2);
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
    expect(onChangeLegendCheckbox).toHaveBeenCalledTimes(1);
  });
});
