import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { DatabaseSelector } from './DatabaseSelector';
import { render } from '../../../utils/test';

describe('DatabaseSelector', () => {
  const handleDatabaseChecked = jest.fn();
  const anyDbTableSelected = jest.fn();
  const setSelectedDb = jest.fn();
  const mockList = [
    { database: { name: 'Test' }, tables: [{ name: 'tablename' }] },
    { database: { name: 'Foo' }, tables: [{ name: 'bar' }, { name: 'baz' }] },
    { database: { name: 'db' }, tables: [{ name: 'bar' }, { name: 'baz' }] },
  ];
  test('Displays databases', () => {
    const search = '';
    render(
      <DatabaseSelector
        databaseList={mockList}
        search={search}
        selectedDb=""
        setSelectedDb={setSelectedDb}
        anyDbTableSelected={anyDbTableSelected}
        handleDatabaseChecked={handleDatabaseChecked}
      />
    );
    mockList.forEach((db) => {
      const dbName = screen.getByLabelText(db.database.name);
      expect(dbName).toBeInTheDocument();
      expect(dbName.getAttribute('checked')).toEqual(null);
    });
  });

  test('Interact with database selection', () => {
    const search = '';
    render(
      <DatabaseSelector
        databaseList={mockList}
        search={search}
        selectedDb=""
        setSelectedDb={setSelectedDb}
        anyDbTableSelected={anyDbTableSelected}
        handleDatabaseChecked={handleDatabaseChecked}
      />
    );
    const toSelect = screen.getByLabelText(mockList[0].database.name);
    fireEvent.click(toSelect);
    expect(handleDatabaseChecked).toHaveBeenCalledTimes(1);
    expect(handleDatabaseChecked).toHaveBeenCalledWith(mockList[0]);
  });

  test('Displays data bases which correspond to search', () => {
    const search = 'fo';
    render(
      <DatabaseSelector
        databaseList={mockList}
        search={search}
        selectedDb=""
        setSelectedDb={setSelectedDb}
        anyDbTableSelected={anyDbTableSelected}
        handleDatabaseChecked={handleDatabaseChecked}
      />
    );
    expect(
      screen.getByLabelText(mockList[1].database.name)
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(mockList[0].database.name)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(mockList[2].database.name)
    ).not.toBeInTheDocument();
  });
});
