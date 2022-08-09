import React, { FunctionComponent, PropsWithChildren } from 'react';
import {
  Cell,
  Column,
  HeaderGroup,
  Row,
  useExpanded,
  useFilters,
  usePagination,
  useSortBy,
  useTable,
} from 'react-table';
import styled from 'styled-components';
// import { Graphic, OptionType, Pagination, Select } from '@cognite/cogs.js';
import { Graphic, OptionType, Pagination, Select } from '@cognite/cogs.js';
import { RunUI } from 'model/Runs';
import { DivFlex } from 'components/styled';
import { Extpipe } from 'model/Extpipe';
import { calculateStatus } from 'utils/extpipeUtils';
import { RunStatusUI } from 'model/Status';
import { ExternalLink } from 'components/links/ExternalLink';

const Wrapper = styled.div`
  margin-bottom: 5rem;
`;
const StyledTable = styled.table`
  grid-area: table;
  thead {
    tr {
      .createdTime-col {
        width: 12rem;
      }
      .status-col {
        width: 9rem;
      }
    }
  }
  tbody {
    tr {
      &:hover,
      &:nth-child(2n):hover {
        background-color: unset;
      }
      &:nth-child(2n) {
        background-color: white;
      }
    }
  }
`;
const itemsPrPageOptions: OptionType<unknown>[] = [
  {
    label: '10',
    value: 10,
  },
  {
    label: '50',
    value: 50,
  },
  {
    label: '100',
    value: 100,
  },
];
const InlineBlockDiv = styled.div`
  display: inline-block;
  width: 5rem;
`;
interface LogsTableProps {
  data: RunUI[];
  columns: Column<RunUI>[];
  fetchData: (params: { pageSize: number }) => void;
  pageCount: number;
  pageSize: number;
  extpipe: Extpipe | null;
}
export const RunLogsTable: FunctionComponent<LogsTableProps> = ({
  data,
  columns,
  fetchData,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
  extpipe,
}: PropsWithChildren<LogsTableProps>) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    rows,
    prepareRow,
    gotoPage,
    setPageSize,
    state: { pageSize }, // pageIndex
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: controlledPageSize },
      pageCount: controlledPageCount,
    },
    useFilters,
    useSortBy,
    useExpanded,
    usePagination
  );

  React.useEffect(() => {
    fetchData({ pageSize });
  }, [fetchData, pageSize]);

  const paginationChanged = (current: number) => {
    gotoPage(current - 1);
  };

  const handleSelectItemsPrPage = (option: OptionType<any>) => {
    setPageSize(option?.value);
  };

  const findOptionValue = (
    options: OptionType<unknown>[],
    innerPageSize: number
  ) => {
    return options.find(({ value }) => value === innerPageSize)!;
  };

  const pipelineNotActivated =
    extpipe != null &&
    calculateStatus({
      lastSuccess: extpipe.lastSuccess,
      lastFailure: extpipe.lastFailure,
    }).status === RunStatusUI.NOT_ACTIVATED;

  const reasonForNoRows = pipelineNotActivated ? (
    <>
      <p style={{ fontWeight: 'bold' }}>
        Activate the extraction pipeline to monitor the status.
      </p>
      <p>
        Learn how to activate an extraction pipeline in the{' '}
        <ExternalLink href="https://docs.cognite.com/cdf/integration/guides/interfaces/about_integrations.html">
          documentation
        </ExternalLink>
      </p>
    </>
  ) : (
    <p>No data is available for this criteria.</p>
  );

  return rows.length === 0 ? (
    <DivFlex align="center" direction="column">
      <Graphic style={{ margin: '2rem 0' }} type="Search" />
      {reasonForNoRows}
      <p>&nbsp;</p>
    </DivFlex>
  ) : (
    <Wrapper>
      <StyledTable {...getTableProps()} className="cogs-table">
        <thead>
          {headerGroups.map((headerGroup: HeaderGroup<RunUI>) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((col: HeaderGroup<RunUI>) => {
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
          {page.map((row: Row<RunUI>) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell: Cell<RunUI>) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </StyledTable>
      <DivFlex align="center" justify="space-between">
        <Pagination
          totalPages={rows.length}
          itemsPerPage={10}
          onPageChange={paginationChanged}
          // keeping for reference, can be deleted after testing the component on UI
          // current={pageIndex + 1}
          // total={rows.length}
          // pageSize={pageSize}
          // onChange={paginationChanged}
          // locale={{ goTo: 'Go to' }}
        />
        <div>
          <InlineBlockDiv>
            <Select
              value={findOptionValue(itemsPrPageOptions, pageSize)}
              onChange={handleSelectItemsPrPage}
              options={itemsPrPageOptions}
            />
          </InlineBlockDiv>
          <span className="select-post-fix">&nbsp; pr page</span>
        </div>
      </DivFlex>
    </Wrapper>
  );
};
