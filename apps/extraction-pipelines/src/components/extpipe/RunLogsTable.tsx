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
import { Graphic, Pagination } from '@cognite/cogs.js'; // OptionType, Select
import { RunUI } from 'model/Runs';
import { DivFlex } from 'components/styled';
import { Extpipe } from 'model/Extpipe';
import { calculateStatus } from 'utils/extpipeUtils';
import { RunStatusUI } from 'model/Status';
import { ExternalLink } from 'components/links/ExternalLink';
import { DEFAULT_ITEMS_PER_PAGE } from 'utils/constants';
import { useTranslation } from 'common';
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
  const { t } = useTranslation();
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    rows,
    prepareRow,
    gotoPage,
    // setPageSize,
    state: { pageIndex, pageSize },
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

  // const handleSelectItemsPrPage = (option: OptionType<any>) => {
  //   setPageSize(option?.value);
  // };

  // const findOptionValue = (
  //   options: OptionType<unknown>[],
  //   innerPageSize: number
  // ) => {
  //   return options.find(({ value }) => value === innerPageSize)!;
  // };

  const pipelineNotActivated =
    extpipe != null &&
    calculateStatus({
      lastSuccess: extpipe.lastSuccess,
      lastFailure: extpipe.lastFailure,
    }).status === RunStatusUI.NOT_ACTIVATED;

  const reasonForNoRows = pipelineNotActivated ? (
    <>
      <p style={{ fontWeight: 'bold' }}>{t('no-run-logs')}</p>
      <p>
        {t('no-run-logs-desc')}{' '}
        <ExternalLink href="https://docs.cognite.com/cdf/integration/guides/interfaces/about_integrations.html">
          {t('documentation', { postProcess: 'lowercase' })}
        </ExternalLink>
      </p>
    </>
  ) : (
    <p>{t('no-data-available')}</p>
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
      <DivFlex align="center" justify="flex-end" style={{ margin: '12px 0' }}>
        <Pagination
          initialCurrentPage={pageIndex + 1}
          hideItemsPerPage
          itemsPerPage={DEFAULT_ITEMS_PER_PAGE}
          totalPages={Math.ceil(rows.length / pageSize)}
          onPageChange={paginationChanged}
        />
        {/* onPageChange doesn't work for pageSize, component doesn't provide necessary event details */}
        {/* <InlineBlockDiv>
          <Select
            value={findOptionValue(PAGINATION_OPTIONS, pageSize)}
            onChange={handleSelectItemsPrPage}
            options={PAGINATION_OPTIONS}
          />
        </InlineBlockDiv> */}
      </DivFlex>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin: 3rem 0;
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

// const InlineBlockDiv = styled.div`
//   display: inline-block;
//   margin-left: 12px;
//   width: 5rem;
// `;
