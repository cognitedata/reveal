import React from 'react';
import { screen } from '@testing-library/react';
import { RawDBTable } from '@cognite/sdk';
import {
  DatabaseTables,
  NO_TABLES_IN_DB,
  SELECT_DB_MESSAGE,
} from './DatabaseTables';
import { render } from '../../../utils/test';
import { SelectedTable } from './RawSelector';

describe('DatabaseTables', () => {
  const onChangeTablesList = jest.fn();
  test('Renders message when no db is selected', () => {
    const selectedDb = '';
    const databaseTables = [{ name: 'db' }];
    const selectedTables: SelectedTable[] = [
      { databaseName: 'db', tableName: 'tablename' },
    ];
    render(
      <DatabaseTables
        selectedDb={selectedDb}
        databaseTables={databaseTables}
        selectedTables={selectedTables}
        onChangeTablesList={onChangeTablesList}
      />
    );
    expect(screen.getByText(SELECT_DB_MESSAGE)).toBeInTheDocument();
  });

  test('Renders message there are no table for db', () => {
    const selectedDb = 'db';
    const databaseTables: RawDBTable[] = [];
    const selectedTables: SelectedTable[] = [];
    render(
      <DatabaseTables
        selectedDb={selectedDb}
        databaseTables={databaseTables}
        selectedTables={selectedTables}
        onChangeTablesList={onChangeTablesList}
      />
    );
    expect(screen.getByText(NO_TABLES_IN_DB)).toBeInTheDocument();
  });
  test('Renders tables', () => {
    const selectedDb = 'db';
    const databaseTables: RawDBTable[] = [
      { name: 'table foo' },
      { name: 'bar' },
      { name: 'baz' },
    ];
    const selectedTables: SelectedTable[] = [];
    render(
      <DatabaseTables
        selectedDb={selectedDb}
        databaseTables={databaseTables}
        selectedTables={selectedTables}
        onChangeTablesList={onChangeTablesList}
      />
    );
    expect(screen.queryByText(NO_TABLES_IN_DB)).not.toBeInTheDocument();
    databaseTables.forEach(({ name }) => {
      const table = screen.getByLabelText(name);
      expect(table).toBeInTheDocument();
      expect(table.getAttribute('checked')).toBeNull();
    });
  });
  test('Displays selected', () => {
    const selectedDb = 'db';
    const databaseTables: RawDBTable[] = [
      { name: 'table foo' },
      { name: 'bar' },
      { name: 'baz' },
    ];
    const selectedTables: SelectedTable[] = [
      { databaseName: selectedDb, tableName: databaseTables[1].name },
    ];
    render(
      <DatabaseTables
        selectedDb={selectedDb}
        databaseTables={databaseTables}
        selectedTables={selectedTables}
        onChangeTablesList={onChangeTablesList}
      />
    );
    const selected = screen.getByLabelText(selectedTables[0].tableName);
    expect(selected.getAttribute('checked')).toBeDefined();
  });
});
