import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { RawEditModalView } from './RawEditModal';
import { render } from '../../utils/test';

jest.mock('../../hooks/useRawDBAndTables', () => {
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

    // type search value into Select
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Table A' },
    });

    // click a value in the Select
    screen.getByText('Good db • Table A').click();

    // wait for clicked value to be present, this way we know state has been set
    await screen.findByText('Good db • Table A');

    // click add new table button again just for kicks? or maybe to ensure we filter
    // out empty entries
    screen.getByTestId('add-new-table=btn').click();

    // click to confirm
    screen.getByTestId('raw-edit-confirm-btn').click();

    expect(onSave).toHaveBeenCalledWith([
      {
        dbName: 'Good db',
        tableName: 'Table A',
      },
    ]);
  });
});
