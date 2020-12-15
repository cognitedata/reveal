import React from 'react';
import { screen } from '@testing-library/react';
import moment from 'moment';
import { getMockResponse } from 'utils/mockResponse';
import DetailsValueView from './DetailsValueView';
import { render } from '../../../utils/test';
import { calculateStatus } from '../../../utils/integrationUtils';

describe('<DetailsValueView />', () => {
  test('Display name for data set when data set exist', () => {
    const data = createCases(0, 'dataSet');
    render(<DetailsValueView fieldValue={data.value} fieldName={data.name} />);
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
        <DetailsValueView
          fieldValue={data.value as number}
          fieldName={data.name}
        />
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

const createCases = (mockResNumber: number, fieldName: string) => {
  const integration = getMockResponse()[mockResNumber];
  const value = integration[`${fieldName}`];
  if (fieldName === 'latestRun') {
    const latest = {
      lastSuccess: integration?.lastSuccess,
      lastFailure: integration?.lastFailure,
    };
    const status = calculateStatus(latest);
    return { value: status.time, name: fieldName };
  }
  return { value, name: fieldName };
};
