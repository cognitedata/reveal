import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  cluster,
  env,
  project,
  transformationId,
  transformationName,
} from '@transformations/__fixtures__';
import { TransformationCreate } from '@transformations/types';
import render from '@transformations/utils/test/render';
import { CdfResourceUsage, CdfUserHistoryService } from '@user-history';

import {
  useCreateTransformation,
  useUpdateTransformation,
} from './transformation';

jest.mock('@cognite/cdf-sdk-singleton', () => {
  // Can't use the following because jest.mock inner scope doesn't allow
  // for functions, external variables, etc.
  // const response = getTransformationUpdate();
  const _transformationId = 1;
  const _transformationName = 'test-transformation';
  const _user = 'test-user';
  const response = {
    id: _transformationId,
    name: _transformationName,
    query:
      '/* MAPPING_MODE_ENABLED: true */\n/* {"version":1,"sourceType":"raw","mappings":[{"from":"","to":"name","asType":"STRING"},{"from":"","to":"parentId","asType":"BIGINT"},{"from":"","to":"description","asType":"STRING"},{"from":"","to":"source","asType":"STRING"},{"from":"","to":"externalId","asType":"STRING"},{"from":"","to":"metadata","asType":"MAP<STRING, STRING>"},{"from":"","to":"parentExternalId","asType":"STRING"},{"from":"","to":"dataSetId","asType":"BIGINT"},{"from":"","to":"labels","asType":"ARRAY<STRING>"}]} */',
    destination: {
      type: 'assets',
    },
    conflictMode: 'abort',
    isPublic: true,
    createdTime: 1695195239175,
    lastUpdatedTime: 1695195239175,
    owner: {
      user: _user,
    },
    ownerIsCurrentUser: true,
    hasSourceOidcCredentials: false,
    hasDestinationOidcCredentials: false,
    externalId: 'tr-test-transformation',
    ignoreNullFields: true,
  };

  return {
    post: jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ data: { items: [response] }, status: 200 })
      ),
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

const mockTransformation: TransformationCreate = {
  name: transformationName,
  externalId: 'tr-test-transformation',
  destination: {
    type: 'assets',
  },
  conflictMode: 'abort',
  ignoreNullFields: true,
  query:
    '/* MAPPING_MODE_ENABLED: true */\n/* {"version":1,"sourceType":"raw","mappings":[{"from":"","to":"name","asType":"STRING"},{"from":"","to":"parentId","asType":"BIGINT"},{"from":"","to":"description","asType":"STRING"},{"from":"","to":"source","asType":"STRING"},{"from":"","to":"externalId","asType":"STRING"},{"from":"","to":"metadata","asType":"MAP<STRING, STRING>"},{"from":"","to":"parentExternalId","asType":"STRING"},{"from":"","to":"dataSetId","asType":"BIGINT"},{"from":"","to":"labels","asType":"ARRAY<STRING>"}]} */',
  isPublic: true,
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

const CreateTransformationTestComponent = () => {
  const { mutate } = useCreateTransformation();

  return (
    <button
      type="button"
      onClick={async () =>
        await mutate({
          transformation: mockTransformation,
          addMapping: false,
          ignoreMappingFailure: true,
        })
      }
    >
      Create
    </button>
  );
};

const UpdateTransformationTestComponent = () => {
  const { mutate } = useUpdateTransformation();

  return (
    <button
      type="button"
      onClick={async () =>
        await mutate({
          id: transformationId,
          update: {},
        })
      }
    >
      Update
    </button>
  );
};

const expected: Omit<CdfResourceUsage, 'timestamp'> = {
  application: 'transformations',
  name: 'test-transformation',
  path: `/${project}/transformations/${transformationId}?cluster=${cluster}&env=${env}`,
};

describe('useCreateTransformation', () => {
  it('should log a new user history event when successfully created', async () => {
    render(<CreateTransformationTestComponent />);

    const createBtn = await screen.findByText('Create');
    userEvent.click(createBtn);

    // Need to wait for the mutation to complete
    await waitFor(() => {
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    expect(mockFn).toHaveBeenCalledWith(expected);
  });
});

describe('useUpdateTransformation', () => {
  it('should log a new user history event when successfully updated', async () => {
    render(<UpdateTransformationTestComponent />);

    const updateBtn = await screen.findByText('Update');
    userEvent.click(updateBtn);

    await waitFor(() => {
      // We expect this to be 2 because we use the same mock function in the create test
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    expect(mockFn.mock.calls[1][0]).toEqual(expected);
  });
});
