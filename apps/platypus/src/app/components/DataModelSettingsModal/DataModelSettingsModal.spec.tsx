import { screen } from '@testing-library/react';
import render from '@platypus-app/tests/render';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { DataModelSettingsModal } from './DataModelSettingsModal';
import { DataModel } from '@platypus/platypus-core';

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
      version: '',
      space: 'testDataModel-1',
    };
    const newName = 'New name';
    const newDescription = 'New description';
    const handleRequestClose = jest.fn();
    render(
      <DataModelSettingsModal
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
        name: 'Confirm',
      })
    );

    expect(mockMutate.mock.calls[0][0]).toEqual({
      description: newDescription,
      externalId: 'testDataModel',
      name: newName,
    });

    expect(handleRequestClose).toHaveBeenCalledTimes(1);
  });
});
