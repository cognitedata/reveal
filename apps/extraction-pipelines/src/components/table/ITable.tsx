import React from 'react';
import { useTable, useSortBy, Column, HeaderGroup } from 'react-table';
import { Colors, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Integration } from '../../model/Integration';

const SortingIcon = styled((props) => <Icon {...props} />)`
  margin-left: 0.25rem;
  vertical-align: middle;
  path {
    fill: ${Colors['greyscale-grey6'].hex()};
  }
`;
function ITable({
  columns,
  data,
}: {
  columns: Column<Integration>[];
  data: Integration[];
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable<Integration>(
    {
      columns,
      data,
    },
    useSortBy
  );

  return (
    <>
      <table {...getTableProps()} className="cogs-table integrations-table">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column: HeaderGroup<Integration>) => (
                // Add the sorting props to control sorting. For this example
                // we can add them into the header props
                // @ts-ignore
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  {/* Add a sort direction indicator */}
                  {/* <span> */}
                  {
                    // @ts-ignore
                    // eslint-disable-next-line no-nested-ternary
                    column.isSorted ? (
                      // @ts-ignore
                      column.isSortedDesc ? (
                        <SortingIcon type="CaretDown" />
                      ) : (
                        <SortingIcon type="CaretUp" />
                      )
                    ) : (
                      ''
                    )
                  }
                  {/* </span> */}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps()}
                className="cogs-table-row integrations-table-row"
              >
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
export default ITable;
