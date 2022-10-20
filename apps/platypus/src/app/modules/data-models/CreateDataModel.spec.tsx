import { getByLabelText, screen } from '@testing-library/react';
import render from '@platypus-app/tests/render';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { CreateDataModel } from './CreateDataModel';
import noop from 'lodash/noop';

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

describe('CreateDataModel', () => {
  beforeEach(() => {
    mockMutate.mockClear();
  });

  it('Fills in external ID value when user types in name', () => {
    render(<CreateDataModel onCancel={noop} />);

    userEvent.type(
      screen.getByLabelText('Name', { exact: false }),
      'My Data Model'
    );

    expect(screen.getByTestId('external-id-field')).toHaveTextContent(
      'myDataModel'
    );
  });

  it('Does not auto update external ID after user has altered it', () => {
    render(<CreateDataModel onCancel={noop} />);

    userEvent.type(
      screen.getByLabelText('Name', { exact: false }),
      'My Data Model'
    );
    userEvent.click(screen.getByLabelText('Edit'));
    userEvent.clear(screen.getByLabelText('External ID'));
    userEvent.type(
      screen.getByLabelText('External ID'),
      'my-data-model{enter}'
    );
    userEvent.type(screen.getByLabelText('Name', { exact: false }), ' etc');

    expect(screen.getByTestId('external-id-field')).toHaveTextContent(
      'my-data-model'
    );
  });

  it('Sends auto-generated external ID when creating data model', () => {
    render(<CreateDataModel onCancel={noop} />);
    const dataModelName = 'My Data Model';

    userEvent.type(
      screen.getByLabelText('Name', { exact: false }),
      dataModelName
    );
    userEvent.click(
      screen.getByRole('button', {
        hidden: true,
        name: 'Confirm',
      })
    );

    expect(mockMutate.mock.calls[0][0]).toEqual({
      externalId: 'myDataModel',
      name: dataModelName,
      description: '',
    });
  });

  it('Sends custom external ID when creating data model', () => {
    render(<CreateDataModel onCancel={noop} />);
    const dataModelName = 'My Data Model';

    userEvent.type(
      screen.getByLabelText('Name', { exact: false }),
      dataModelName
    );
    userEvent.click(screen.getByLabelText('Edit'));
    userEvent.clear(screen.getByLabelText('External ID'));
    userEvent.type(
      screen.getByLabelText('External ID'),
      'my-data-model{enter}'
    );
    userEvent.click(
      screen.getByRole('button', {
        hidden: true,
        name: 'Confirm',
      })
    );

    expect(mockMutate.mock.calls[0][0]).toEqual({
      externalId: 'my-data-model',
      name: dataModelName,
      description: '',
    });
  });
});
