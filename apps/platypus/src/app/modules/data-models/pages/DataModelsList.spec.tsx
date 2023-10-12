import { DataModel } from '@platypus/platypus-core';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import noop from 'lodash/noop';

import { useDataModels } from '../../../hooks/useDataModelActions';
import render from '../../../tests/render';

import { DataModelsList } from './DataModelsList';

jest.mock('@platypus-app/hooks/useMixpanel');
jest.mock('@platypus-app/hooks/useCapabilities');
jest.mock('@platypus-app/hooks/useDataModelActions');

jest.mock('@platypus-app/components/DataModelLibrary/DataModelLibrary', () => {
  return {
    DataModelLibrary: () => <p>Mock</p>,
  };
});

/*
These are cast to jest.Mock<unknown> because otherwise our mock implementations would
have to match the return type of useQuery which is 20 or so properties.
TODO figure out a better solution
*/
const mockedUseDataModels = useDataModels as jest.Mock<unknown>;

const dataModels: DataModel[] = [
  {
    createdTime: 1636107405779,
    description: 'This is a very good app',
    id: '1',
    name: 'BestDay',
    owners: ['Ola Nordmann'],
    space: 'my-space',
    updatedTime: 1636107405779,
    graphQlDml: '',
    version: '1',
  },
  {
    createdTime: 1636107405779,
    description: 'This is a very good app',
    id: '2',
    name: 'APM',
    owners: ['Ola Nordmann'],
    space: 'my-space',
    updatedTime: 1636107405779,
    graphQlDml: '',
    version: '1',
  },
  {
    createdTime: 1636107405779,
    description: 'This is a very good app',
    id: '3',
    name: 'Maintain',
    owners: ['Ola Nordmann'],
    space: 'my-space',
    updatedTime: 1636107405779,
    graphQlDml: '',
    version: '1',
  },
];

describe('DataModelsList', () => {
  it('shows data model count when there are no data models', () => {
    mockedUseDataModels.mockImplementation(() => ({
      data: [],
      isLoading: false,
      isError: false,
      refetch: noop,
    }));

    render(<DataModelsList />);

    expect(screen.getByText('Data Models (0)')).toBeTruthy();
  });

  it('shows data model count when there are data models', () => {
    mockedUseDataModels.mockImplementation(() => ({
      data: dataModels,
      isLoading: false,
      isError: false,
      refetch: noop,
    }));

    render(<DataModelsList />);

    expect(screen.getByText('Data Models (3)')).toBeTruthy();
  });

  it('shows data model count when there is a filter with some results', () => {
    mockedUseDataModels.mockImplementation(() => ({
      data: dataModels,
      isLoading: false,
      isError: false,
      refetch: noop,
    }));

    render(<DataModelsList />);

    userEvent.type(screen.getByPlaceholderText(/search/i), 'maint');

    expect(screen.getByText('Data Models (1)')).toBeTruthy();
  });

  it('shows data model count when there is a filter with no results', () => {
    mockedUseDataModels.mockImplementation(() => ({
      data: dataModels,
      isLoading: false,
      isError: false,
      refetch: noop,
    }));

    render(<DataModelsList />);

    userEvent.type(screen.getByPlaceholderText(/search/i), 'doesnotexist');

    expect(screen.getByText('Data Models (0)')).toBeTruthy();
  });
});
