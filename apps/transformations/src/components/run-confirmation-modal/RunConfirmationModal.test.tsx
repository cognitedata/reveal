import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  cluster,
  env,
  project,
  transformationId,
  transformationName,
} from '@transformations/__fixtures__';
import render from '@transformations/utils/test/render';
import { CdfResourceUsage, CdfUserHistoryService } from '@user-history';

import RunConfirmationModal from './RunConfirmationModal';

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useParams: () => ({
      subAppPath: 'transformations',
    }),
  };
});

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

describe('RunConfirmationModal', () => {
  it('should not log usage if shouldLogUsage is false', async () => {
    render(
      <RunConfirmationModal
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
        open={true}
        items={[]}
      />
    );
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('should log usage when shouldLogUsage is true', async () => {
    render(
      <RunConfirmationModal
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
        open={true}
        items={[]}
        shouldLogUsage={true}
        transformationId={transformationId}
        transformationName={transformationName}
      />
    );

    const runNow = await screen.findByText('Yes, run now');

    userEvent.click(runNow);

    const expected: Omit<CdfResourceUsage, 'timestamp'> = {
      application: 'transformations',
      name: 'test-transformation',
      path: `/${project}/transformations/${transformationId}?cluster=${cluster}&env=${env}`,
    };

    expect(mockFn).toHaveBeenCalledTimes(1);

    expect(mockFn).toHaveBeenCalledWith(expected);
  });
});
