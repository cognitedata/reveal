import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { RawEditModalView } from 'components/modals/RawEditModal';
import { render } from 'utils/test';

jest.mock('hooks/useRawDBAndTables', () => {
  return {
    useRawDBAndTables: jest.fn(),
  };
});
describe('RawEditModal', () => {
  test('Should call onSave with the new table as param', async () => {
    const close = jest.fn();
    const onSave = jest.fn();
    render(
      <RawEditModalView
        close={close}
        onSave={onSave}
        initial={[]}
        databases={[
          {
            database: { name: 'Good db' },
            tables: [{ name: 'Table A' }, { name: 'Table B' }],
          },
        ]}
      />
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Table A' },
    });

    screen.getByText('Good db • Table A').click();

    screen.getByTestId('add-new-table=btn').click();

    screen.getByTestId('raw-edit-confirm-btn').click();

    expect(onSave).toHaveBeenCalledWith([
      {
        dbName: 'Good db',
        tableName: 'Table A',
      },
    ]);
  });
});
