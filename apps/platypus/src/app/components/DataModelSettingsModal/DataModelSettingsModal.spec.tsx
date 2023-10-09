import { DataModel } from '@platypus/platypus-core';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import render from '../../tests/render';

import { DataModelSettingsModal } from './DataModelSettingsModal';

const mockMutate = jest.fn().mockImplementation((_, options) => {
  options.onSuccess();
});
jest.mock(
  '@platypus-app/modules/data-models/hooks/useDataModelMutation',
  () => {
    return {
      useDataModelMutation: () => ({
        update: {
          mutate: mockMutate,
        },
      }),
    };
  }
);

jest.mock('@platypus-app/hooks/useDataModelActions');

jest.mock('../DataModelLibrary/DataModelLibrary', () => {
  return {
    DataModelLibrary: () => <p>Mock</p>,
  };
});

jest.mock('@cognite/cdf-utilities', () => {
  return {
    useCdfUserHistoryService: () => ({
      logNewResourceEdit: jest.fn(),
      logNewResourceView: jest.fn(),
    }),
    getProject: jest.fn().mockReturnValue('mock-project'),
    getCluster: jest.fn().mockReturnValue('mock-cluster'),
    createLink: jest.fn().mockReturnValue('mock-link'),
  };
});

describe('DataModelSettingsModal', () => {
  beforeEach(() => {
    mockMutate.mockClear();
  });

  it('Makes update call with data model name and description', () => {
    const dataModel: DataModel = {
      createdTime: 1635936707155,
      description: 'Test DataModel',
      id: 'testDataModel',
      name: 'Test DataModel',
      owners: [],
      updatedTime: 1635936707155,
      version: '1',
      space: 'testDataModel-1',
      graphQlDml: '',
    };
    const newName = 'New_Name';
    const newDescription = 'Test DataModel';
    const handleRequestClose = jest.fn();
    render(
      <DataModelSettingsModal
        visible
        dataModel={dataModel}
        onRequestClose={handleRequestClose}
      />
    );
    const nameInput = screen.getByLabelText('Name', { exact: false });
    const descriptionInput = screen.getByLabelText('Description', {
      exact: false,
    });

    userEvent.clear(nameInput);
    userEvent.type(nameInput, newName);
    userEvent.clear(descriptionInput);
    userEvent.type(descriptionInput, newDescription);
    userEvent.click(
      screen.getByRole('button', {
        hidden: true,
        name: 'Update',
      })
    );

    expect(mockMutate.mock.calls[0][0]).toEqual({
      description: newDescription,
      externalId: 'testDataModel',
      name: newName,
      space: 'testDataModel-1',
      version: '1',
    });

    expect(handleRequestClose).toHaveBeenCalledTimes(1);
  });
});
