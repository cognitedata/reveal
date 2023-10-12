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
import { noop } from 'lodash';

import { Menu } from '@cognite/cogs.js';

import { RunNowItem } from './RunNowItem';

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

describe('TransformationDetailsTopbarActionButtons', () => {
  it('should properly store a user history event when clicking on the "Run now" button', async () => {
    render(
      <Menu>
        <RunNowItem
          onClick={noop}
          transformationId={transformationId}
          transformationName={transformationName}
        />
      </Menu>
    );

    const runAsCurrentUserButton = await screen.findByRole('menuitem', {
      name: 'Run as current user',
    });

    userEvent.click(runAsCurrentUserButton);

    const expected: Omit<CdfResourceUsage, 'timestamp'> = {
      application: 'transformations',
      name: 'test-transformation',
      path: `/${project}/transformations/${transformationId}?cluster=${cluster}&env=${env}`,
    };

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(expected);
  });
});
