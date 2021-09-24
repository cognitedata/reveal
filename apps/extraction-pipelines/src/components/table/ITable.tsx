import React, { ReactText, useMemo, useState } from 'react';
import {
  ActionType,
  Cell,
  Column,
  HeaderGroup,
  Row,
  TableState,
  useFilters,
  useGlobalFilter,
  useRowSelect,
  useSortBy,
  useTable,
} from 'react-table';
import { matchSorter } from 'match-sorter';
import { useHistory } from 'react-router-dom';
import { createExtPipePath } from 'utils/baseURL';
import { EXT_PIPE_PATH } from 'routing/RoutingConfig';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useAppEnv } from 'hooks/useAppEnv';
import IntegrationTableSearch from 'components/table/IntegrationTableSearch';
import { EXTRACTION_PIPELINE_LOWER } from 'utils/constants';
import { Button, Modal } from '@cognite/cogs.js';
import { ids } from 'cogs-variables';
import { CreateIntegration } from 'pages/create/CreateIntegration';
import styled from 'styled-components';

const selectReducer = (
  newState: TableState,
  action: ActionType,
  previousState: TableState
) => {
  switch (action.type) {
    case 'toggleRowSelected':
      return {
        ...previousState,
        selectedRowIds: { [action.id]: action.value },
      };
    default:
      return { ...previousState, ...newState };
  }
};

interface ITableProps<T extends object> {
  data: T[];
  columns: Column<T>[];
}
const fuzzyTextFilterFn = <T extends { values: any }>(
  rows: ReadonlyArray<T>,
  id: string,
  filterValue: any
) => {
  return matchSorter([...rows], filterValue, {
    keys: [(row) => row.values[id]],
  });
};
fuzzyTextFilterFn.autoRemove = (val: boolean) => !val;

const TableTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CreateExtpipeModal = (props: { visible: boolean; close: () => void }) => {
  return (
    <Modal
      visible={props.visible}
      width={600}
      closable
      onCancel={props.close}
      appElement={document.getElementsByClassName(ids.styleScope).item(0)!}
      getContainer={() =>
        document.getElementsByClassName(ids.styleScope).item(0) as any
      }
      footer={null}
      title="Create extraction pipeline"
    >
      <CreateIntegration
        showAdditionalFields={false}
        customCancelCallback={props.close}
      />
    </Modal>
  );
};

const ITable = <T extends { id: ReactText }>({
  data,
  columns,
}: ITableProps<T>) => {
  const { setIntegration } = useSelectedIntegration();
  const { project } = useAppEnv();
  const history = useHistory();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const filterTypes = React.useMemo(
    () => ({
      fuzzyText: fuzzyTextFilterFn,
      text: (rows: { values: any }[], id: string, filterValue: any) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    []
  );

  const dataSource = useMemo(() => {
    return data;
  }, [data]);
  const headerCols = useMemo(() => {
    return columns;
  }, [columns]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    setGlobalFilter,
    preGlobalFilteredRows,
  } = useTable<T>(
    {
      columns: headerCols,
      data: dataSource,
      autoResetSelectedRows: false,
      stateReducer: selectReducer as any,
      filterTypes,
      initialState: {
        hiddenColumns: ['externalId'],
      },
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    useRowSelect
  );

  return (
    <>
      <CreateExtpipeModal
        visible={createModalOpen}
        close={() => setCreateModalOpen(false)}
      />
      <TableTop>
        <IntegrationTableSearch
          globalFilter={state.globalFilter}
          preGlobalFilteredRows={preGlobalFilteredRows}
          setGlobalFilter={setGlobalFilter}
        />
        <Button
          variant="default"
          type="primary"
          icon="PlusCompact"
          onClick={() => {
            setCreateModalOpen(true);
          }}
        >
          Create extraction pipeline
        </Button>
      </TableTop>
      <table
        {...getTableProps()}
        className="cogs-table integrations-table"
        role="grid"
        aria-label={`List of ${EXTRACTION_PIPELINE_LOWER} for the ${project} project`}
      >
        <thead>
          {headerGroups.map((headerGroup: HeaderGroup<any>) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((col: HeaderGroup<T>) => {
                return (
                  <th
                    scope="col"
                    {...col.getHeaderProps(col.getSortByToggleProps())}
                    className={`${col.id}-col`}
                  >
                    {col.disableFilters && col.render('Header')}
                    {!col.disableFilters && col.render('Filter')}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row: Row<T>) => {
            prepareRow(row);
            const handleClickOnRow = () => {
              row.toggleRowSelected(true);
              // @ts-ignore
              setIntegration(row.original);
            };
            return (
              <tr
                {...row.getRowProps()}
                className={`cogs-table-row integrations-table-row ${
                  row.isSelected ? 'row-active' : ''
                }`}
                onClick={handleClickOnRow}
              >
                {row.cells.map((cell: Cell<T>) => {
                  const handleCellClick = (
                    e: React.MouseEvent<HTMLTableDataCellElement>
                  ) => {
                    if (e.currentTarget === e.target) {
                      history.push(
                        createExtPipePath(
                          `/${EXT_PIPE_PATH}/${row.original.id}`
                        )
                      );
                    }
                  };
                  return (
                    // Name column has focusable link for accessibility. Cell click handler is for easy access for mouse users
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
                    <td
                      {...cell.getCellProps()}
                      className={`${cell.column.id}-cell`}
                      onClick={handleCellClick}
                    >
                      {cell.render('Cell')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};
export default ITable;
