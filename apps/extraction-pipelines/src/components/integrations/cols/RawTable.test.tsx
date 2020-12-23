import React from 'react';
import { screen } from '@testing-library/react';
import RawTable, { NO_RAW_TABLES_MESSAGE } from './RawTable';
import { render } from '../../../utils/test';
import { getMockResponse } from '../../../utils/mockResponse';

describe('<RawTable />', () => {
  test('Should render without error', () => {
    const integration = getMockResponse()[0];
    const { rawTables } = integration;
    render(<RawTable rawTables={rawTables} />);
    expect(screen.getByText(rawTables[0].dbName)).toBeInTheDocument();
    expect(screen.getByText(rawTables[0].tableName)).toBeInTheDocument();
  });

  test('Should display no raw table set message when rawtable is undefiend', () => {
    render(<RawTable rawTables={undefined} />);
    expect(screen.getByText(NO_RAW_TABLES_MESSAGE)).toBeInTheDocument();
  });

  test('Should display no raw table set message when rawtable is empty', () => {
    render(<RawTable rawTables={[]} />);
    expect(screen.getByText(NO_RAW_TABLES_MESSAGE)).toBeInTheDocument();
  });
});
