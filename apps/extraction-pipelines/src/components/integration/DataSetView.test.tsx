import React from 'react';
import { screen } from '@testing-library/react';
import {
  DATA_SET_ID_LABEL,
  DATA_SET_NAME_LABEL,
  DataSetView,
} from './DataSetView';
import { render } from '../../utils/test';
import { NO_DATA_SET_ID_SET } from '../../utils/constants';

describe('DataSetView', () => {
  test('Should render name and id', () => {
    const dataSetId = 'dataset123';
    const dataSet = { name: 'My data set', id: dataSetId };
    render(<DataSetView dataSetId={dataSetId} dataSet={dataSet} />);
    expect(screen.getByText(dataSetId)).toBeInTheDocument();
    expect(screen.getByText(dataSet.name)).toBeInTheDocument();
  });

  test('Should render datasetid when no data set', () => {
    const dataSetId = 'dataset123';
    const dataSet = undefined;
    render(<DataSetView dataSetId={dataSetId} dataSet={dataSet} />);
    expect(screen.getByText(dataSetId)).toBeInTheDocument();
    expect(screen.queryByText(DATA_SET_NAME_LABEL)).not.toBeInTheDocument();
  });

  test('Should render no data set when dataset id is undefined', () => {
    const dataSetId = undefined;
    const dataSet = undefined;
    render(<DataSetView dataSetId={dataSetId} dataSet={dataSet} />);
    expect(screen.getByText(NO_DATA_SET_ID_SET)).toBeInTheDocument();
    expect(screen.queryByText(DATA_SET_ID_LABEL)).not.toBeInTheDocument();
    expect(screen.queryByText(DATA_SET_NAME_LABEL)).not.toBeInTheDocument();
  });
});
