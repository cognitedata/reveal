import render from '@platypus-app/tests/render';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import noop from 'lodash/noop';

import { CreateDataModel } from './CreateDataModel';

jest.mock('@platypus-app/hooks/useMixpanel');
jest.mock('@platypus-app/hooks/useDataModelActions');

jest.mock('@platypus-app/components/DataModelLibrary/DataModelLibrary', () => {
  return {
    DataModelLibrary: () => <p>Mock</p>,
  };
});

jest.mock('@platypus-app/hooks/useSpaces', () => {
  return {
    useSpaces: () => ({
      data: [
        {
          space: 'My_Space_1',
          name: 'My_Space_1',
          createdTime: 12345678,
          lastUpdatedTime: 12345678,
        },
      ],
      isLoading: true,
      isError: false,
    }),
  };
});

jest.mock('../../hooks/useDataSets', () => {
  return {
    useDataSets: () => ({
      data: [],
      isLoading: true,
      isError: false,
    }),
  };
});

const mockMutate = jest.fn();
jest.mock('./hooks/useDataModelMutation', () => {
  return {
    useDataModelMutation: () => ({
      create: {
        mutate: mockMutate,
      },
    }),
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
  };
});

describe('CreateDataModel', () => {
  beforeEach(() => {
    mockMutate.mockClear();
  });

  it('Fills in external ID value when user types in name', () => {
    render(<CreateDataModel onCancel={noop} visible />);

    userEvent.type(
      screen.getByLabelText('Name', { exact: false }),
      'My Data Model'
    );

    expect(screen.getByTestId('external-id-field')).toHaveTextContent(
      'My_Data_Model'
    );
  });

  it('Does not auto update external ID after user has altered it', () => {
    render(<CreateDataModel onCancel={noop} visible />);

    userEvent.type(
      screen.getByLabelText('Name', { exact: false }),
      'My Data Model'
    );
    userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    userEvent.clear(screen.getByLabelText('External ID'));
    userEvent.type(
      screen.getByLabelText('External ID'),
      'My_Data_Model{enter}'
    );
    userEvent.type(screen.getByLabelText('Name', { exact: false }), ' etc');

    expect(screen.getByTestId('external-id-field')).toHaveTextContent(
      'My_Data_Model'
    );
  });

  it('Sends auto-generated external ID when creating data model', () => {
    render(<CreateDataModel onCancel={noop} visible />);
    const dataModelName = 'My_Data_Model';

    userEvent.type(
      screen.getByLabelText('Name', { exact: false }),
      dataModelName
    );
    userEvent.click(screen.getByText('Select space'));
    userEvent.click(screen.getByText('My_Space_1'));
    userEvent.click(
      screen.getByRole('button', {
        hidden: true,
        name: 'Create',
      })
    );

    expect(mockMutate.mock.calls[0][0]).toEqual({
      externalId: 'My_Data_Model',
      name: dataModelName,
      description: '',
      space: 'My_Space_1',
    });
  });

  it('Sends custom external ID when creating data model', () => {
    render(<CreateDataModel onCancel={noop} visible />);
    const dataModelName = 'My_Data_Model';

    userEvent.type(
      screen.getByLabelText('Name', { exact: false }),
      dataModelName
    );
    userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    userEvent.clear(screen.getByLabelText('External ID'));
    userEvent.type(
      screen.getByLabelText('External ID'),
      'My_Data_Model{enter}'
    );
    userEvent.click(screen.getByText('Select space'));
    userEvent.click(screen.getByText('My_Space_1'));
    userEvent.click(
      screen.getByRole('button', {
        hidden: true,
        name: 'Create',
      })
    );

    expect(mockMutate.mock.calls[0][0]).toEqual({
      externalId: 'My_Data_Model',
      name: dataModelName,
      description: '',
      space: 'My_Space_1',
    });
  });
});
