import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'utils/test';
import { getMockResponse, mockDataSetResponse } from 'utils/mockResponse';
import { DataSet } from 'components/extpipes/cols/DataSet';
import { NO_DATA_SET_ID_SET } from 'utils/constants';

describe('<DataSet />', () => {
  test('Should render without error', () => {
    const extpipe = getMockResponse()[0];
    const { dataSetId } = extpipe;
    const dataSet = mockDataSetResponse()[0];
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
    expect(screen.getByTestId('no-data-set')).toBeInTheDocument();
  });
  test('Should display no data set message when data set id is null', () => {
    render(<DataSet id="data-set-id" dataSetId={null} dataSetName={null} />);
    expect(screen.getByTestId('no-data-set')).toBeInTheDocument();
  });

  test('Should display no data set message when data set id is empty', () => {
    render(<DataSet id="data-set-id" dataSetId="" dataSetName="" />);
    expect(screen.getByTestId('no-data-set')).toBeInTheDocument();
  });
});
