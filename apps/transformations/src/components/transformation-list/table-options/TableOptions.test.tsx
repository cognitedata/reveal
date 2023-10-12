import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  cluster,
  env,
  getTransformationRead,
  project,
  transformationId,
} from '@transformations/__fixtures__';
import { TransformationListTableRecord } from '@transformations/pages/transformation-list/TransformationListTable';
import render from '@transformations/utils/test/render';
import { CdfResourceUsage, CdfUserHistoryService } from '@user-history';

import TableOptions from './TableOptions';

jest.mock('@cognite/cdf-sdk-singleton', () => {
  return {
    post: jest.fn(),
  };
});

jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({
      subAppPath: 'transformations',
    }),
  };
});

const mockTransformation: TransformationListTableRecord = {
  ...getTransformationRead(),
  key: '1',
  hasCredentials: true,
};

const mockFn = jest.fn();

jest
  .spyOn(CdfUserHistoryService.prototype, 'logNewResourceEdit')
  .mockImplementation(mockFn);

const url = new URL(`https://localhost:3000/${project}/transformations`);
url.searchParams.set('cluster', cluster);
url.searchParams.set('env', env);

Object.defineProperty(window, 'location', {
  value: url,
  writable: true,
});

describe('TableOptions', () => {
  it('should log a new user history event we pause a transformation', async () => {
    render(
      <TableOptions transformation={mockTransformation} onDelete={jest.fn()} />
    );

    const options = await screen.findByLabelText('Options');
    userEvent.click(options);

    const pauseBtn = await screen.findByText('Pause schedule');
    userEvent.click(pauseBtn);

    expect(mockFn).toHaveBeenCalledTimes(1);

    const expected: Omit<CdfResourceUsage, 'timestamp'> = {
      application: 'transformations',
      name: 'test-transformation',
      path: `/${project}/transformations/${transformationId}?cluster=${cluster}&env=${env}`,
    };

    expect(mockFn).toHaveBeenCalledWith(expected);
  });
});
