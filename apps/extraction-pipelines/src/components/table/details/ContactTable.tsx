import React, { useMemo } from 'react';
import { Column, TableOptions, useExpanded, useTable } from 'react-table';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { IntegrationFieldValue } from './DetailsCols';
import { ContactsTableCol } from './ContactTableCols';
import { EditStyleTable, StyledTable } from '../../../styles/StyledTable';

const StyledTableContacts = styled((props) => (
  <EditStyleTable {...props}>{props.children}</EditStyleTable>
))`
  tbody {
    tr {
      &:first-child {
        td {
          border-bottom: 0.125rem solid ${Colors['greyscale-grey3'].hex()};
        }
      }
    }
  }
`;

export interface EditableHelpersContacts {
  updateData: (
    rowIndex: number,
    columnId: string,
    value: IntegrationFieldValue
  ) => void;
  undoChange: (rowIndex: number) => void;
  saveChange: (rowIndex: number, data: ContactsTableCol) => void;
  removeContact: (rowIndex: number, data: ContactsTableCol) => void;
}

interface OwnProps<T extends object> extends EditableHelpersContacts {
  data: T[];
  columns: Column<T>[];
}

const ContactsTable = <T extends object>({
  data: originalData,
  columns,
  updateData,
  undoChange,
  saveChange,
  removeContact,
}: OwnProps<T>) => {
  const dataSource = useMemo(() => {
    return originalData;
  }, [originalData]);
  const headerCols = useMemo(() => {
    return columns;
  }, [columns]);

  const { getTableProps, getTableBodyProps, rows, prepareRow } = useTable(
    {
      columns: headerCols,
      data: dataSource,
      autoResetExpanded: false,
      updateData,
      undoChange,
      saveChange,
      removeContact,
    } as TableOptions<T>,
    useExpanded
  );

  return (
    <StyledTable>
      <StyledTableContacts
        {...getTableProps()}
        className="cogs-table integrations-table"
      >
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps()}
                className={`cogs-table-row integrations-table-row ${
                  row.isSelected ? 'row-active' : ''
                }`}
              >
                {row.cells.map((cell) => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      className={`${cell.column.id}`}
                    >
                      {cell.render('Cell')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </StyledTableContacts>
    </StyledTable>
  );
};

export default ContactsTable;
