import { PropsWithChildren } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import {
  CdfResourceUsage,
  CdfUserHistoryService,
  UserHistoryProvider,
} from '@user-history';

import { useCreateDataSetMutation, useUpdateDataSetMutation } from '.';

const env = 'test-cluster';
const cluster = 'test-cluster';
const project = 'test-project';
const user = 'test-user';
const dataSetName = 'test-dataset';
const dataSetId = 1;

const payload = {
  name: dataSetName,
  description: 'test-data-set description',
  writeProtected: false,
  metadata: {
    consoleCreatedBy: { username: 'Testy McTestFace' },
    consoleMetaDataVersion: 3,
    consoleLabels: [],
  },
};

jest.mock('@cognite/cdf-sdk-singleton', () => {
  const response = {
    name: dataSetName,
    description: 'test-data-set description',
    metadata: {
      consoleCreatedBy: { username: 'Testy McTestFace' },
      consoleMetaDataVersion: 3,
      consoleLabels: [],
    },
    writeProtected: false,
    id: dataSetId,
    createdTime: 1695213240892,
    lastUpdatedTime: 1695213240892,
  };

  return {
    datasets: {
      create: jest.fn().mockImplementation(() => Promise.resolve([response])),
      update: jest.fn().mockImplementation(() => Promise.resolve([response])),
    },
  };
});

jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({
      appPath: 'data-catalog',
    }),
  };
});

const Providers = ({ children }: PropsWithChildren) => {
  const qc = new QueryClient();
  return (
    <QueryClientProvider client={qc}>
      <UserHistoryProvider cluster={cluster} project={project} userId={user}>
        {children}
      </UserHistoryProvider>
    </QueryClientProvider>
  );
};

const mockFn = jest.fn();

jest
  .spyOn(CdfUserHistoryService.prototype, 'logNewResourceEdit')
  .mockImplementation(mockFn);

const url = new URL(`https://localhost:3000/${project}/data-catalog`);
url.searchParams.set('cluster', cluster);
url.searchParams.set('env', env);

Object.defineProperty(window, 'location', {
  value: url,
  writable: true,
});

const CreateDataSetTestComponent = () => {
  const { createDataSet } = useCreateDataSetMutation();

  return (
    <button type="button" onClick={async () => await createDataSet(payload)}>
      Create
    </button>
  );
};

const UpdateDataSetTestComponent = () => {
  const { updateDataSet } = useUpdateDataSetMutation();

  return (
    <button
      type="button"
      onClick={async () =>
        await updateDataSet({
          ...payload,
          id: dataSetId,
          createdTime: Date.now(),
          lastUpdatedTime: Date.now(),
        } as any)
      }
    >
      Update
    </button>
  );
};

describe('useCreateDataSetMutation', () => {
  it('should log a user history event when a dataset is created', async () => {
    render(
      <Providers>
        <CreateDataSetTestComponent />
      </Providers>
    );

    await waitFor(() => {
      screen.getByText('Create').click();
    });

    const expected: Omit<CdfResourceUsage, 'timestamp'> = {
      application: 'data-catalog',
      name: dataSetName,
      path: `/${project}/data-catalog/data-set/${dataSetId}?cluster=${cluster}&env=${env}`,
    };

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(expected);
  });
});

describe('useUpdateDataSetMutation', () => {
  it('should log a user history event when a dataset is updated', async () => {
    render(
      <Providers>
        <UpdateDataSetTestComponent />
      </Providers>
    );

    await waitFor(() => {
      screen.getByText('Update').click();
    });

    const expected: Omit<CdfResourceUsage, 'timestamp'> = {
      application: 'data-catalog',
      name: dataSetName,
      path: `/${project}/data-catalog/data-set/${dataSetId}?cluster=${cluster}&env=${env}`,
    };

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn.mock.calls[1][0]).toEqual(expected);
  });
});
