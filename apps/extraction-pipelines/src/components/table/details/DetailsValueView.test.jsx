import React from 'react';
import { screen } from '@testing-library/react';
import moment from 'moment';
import { getMockResponse, mockDataSetResponse } from 'utils/mockResponse';
import DetailsValueView from 'components/table/details/DetailsValueView';
import { render } from 'utils/test';
import { calculateStatus } from 'utils/extpipeUtils';
import { NO_DATA_SET_ID_SET } from 'utils/constants';

const createCases = (mockResNumber, fieldName) => {
  const extpipe = {
    ...getMockResponse()[mockResNumber],
    dataSet: mockDataSetResponse()[mockResNumber],
  };
  const value = extpipe[`${fieldName}`];
  if (fieldName === 'latestRun') {
    const latest = {
      lastSuccess: extpipe?.lastSuccess,
      lastFailure: extpipe?.lastFailure,
    };
    const status = calculateStatus(latest);
    return { value: status.time, name: fieldName };
  }
  return { value, name: fieldName };
};

describe('<DetailsValueView />', () => {
  test('Display name for data set when data set exist', () => {
    const data = createCases(0, 'dataSet');
    render(<DetailsValueView fieldValue={data.value} fieldName={data.name} />); //
    const view = screen.getByText(data.value.name);
    expect(view).toBeInTheDocument();

    const copy = screen.getByTestId('interactive-copy');
    expect(copy).toBeInTheDocument();
  });

  test('Display id for data set when data set not exist', () => {
    const data = createCases(1, 'dataSetId');
    render(<DetailsValueView fieldValue={data.value} fieldName={data.name} />);
    const view = screen.getByText(data.value);
    expect(view).toBeInTheDocument();
    const copy = screen.getByTestId('interactive-copy');
    expect(copy).toBeInTheDocument();
  });

  test('Display no data set when no data set is registered on extpipe', () => {
    render(<DetailsValueView fieldValue="" fieldName="dataSetId" />);
    const view = screen.getByTestId('no-data-set');
    expect(view).toBeInTheDocument();
    const copy = screen.queryByTestId('interactive-copy');
    expect(copy).not.toBeInTheDocument();
  });

  const cases = [
    {
      fieldName: 'createdTime',
      desc: 'Display relative time for createdTime',
    },
    { fieldName: 'lastSeen', desc: 'Display relative time for lastSeeen' },
    { fieldName: 'latestRun', desc: 'Display relative time for latestRun' },
  ];
  cases.forEach(({ desc, fieldName }) => {
    test(`${desc}`, () => {
      const data = createCases(0, fieldName);
      render(
        <DetailsValueView fieldValue={data.value} fieldName={data.name} />
      );
      const view = screen.getByText(moment(data.value).fromNow());
      expect(view).toBeInTheDocument();
    });
  });

  test('Display human readable time  for schedule', () => {
    const data = createCases(0, 'schedule');
    render(<DetailsValueView fieldValue={data.value} fieldName={data.name} />);
    const view = screen.queryByText(data.value);
    expect(view).not.toBeInTheDocument();
    const view2 = screen.getByText('At 09:00 AM');
    expect(view2).toBeInTheDocument();
  });

  test('Display copy for externalId', () => {
    const data = createCases(0, 'externalId');
    render(<DetailsValueView fieldValue={data.value} fieldName={data.name} />);
    const view = screen.getByTestId('interactive-copy');
    expect(view).toBeInTheDocument();
  });
});
