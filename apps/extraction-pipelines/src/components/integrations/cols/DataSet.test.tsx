import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../../utils/test';
import { getMockResponse } from '../../../utils/mockResponse';
import { DataSet, NO_DATA_SET_ID_SET } from './DataSet';

describe('<DataSet />', () => {
  test('Should render without error', () => {
    const integration = getMockResponse()[0];
    const { dataSetId, dataSet } = integration;
    render(
      <DataSet
        id="data-set-id"
        dataSetId={dataSetId}
        dataSetName={dataSet?.name}
      />
    );
    expect(screen.getByText(dataSet.name)).toBeInTheDocument();
  });

  test('Should display no data set message when data set id is undefiend', () => {
    render(
      <DataSet id="data-set-id" dataSetId={undefined} dataSetName={undefined} />
    );
    expect(screen.getByText(NO_DATA_SET_ID_SET)).toBeInTheDocument();
  });
  test('Should display no data set message when data set id is null', () => {
    render(<DataSet id="data-set-id" dataSetId={null} dataSetName={null} />);
    expect(screen.getByText(NO_DATA_SET_ID_SET)).toBeInTheDocument();
  });

  test('Should display no data set message when data set id is empty', () => {
    render(<DataSet id="data-set-id" dataSetId="" dataSetName="" />);
    expect(screen.getByText(NO_DATA_SET_ID_SET)).toBeInTheDocument();
  });
});
