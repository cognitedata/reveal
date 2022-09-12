import React, { useMemo } from 'react';
import {
  Cell,
  HeaderGroup,
  Row,
  usePagination,
  useSortBy,
  useTable,
} from 'react-table';
import styled from 'styled-components';
import { Graphic, Pagination } from '@cognite/cogs.js'; // OptionType, Select
import { DivFlex } from 'components/styled';

import { ExternalLink } from 'components/links/ExternalLink';
import { useTranslation } from 'common';
import { useRunFilterContext } from 'hooks/runs/RunsFilterContext';
import { useAllRuns, useRuns } from 'hooks/useRuns';
import { useRunLogTableCol } from 'components/extpipe/RunLogsCols';
import { RunApi } from 'model/Runs';

interface Props {
  externalId: string;
}
export const RunLogsTable = ({ externalId }: Props) => {
  const { t } = useTranslation();

  const {
    state: { dateRange, statuses, search },
  } = useRunFilterContext();

  const { data } = useAllRuns({
    externalId,
    statuses,
    search,
    dateRange,
  });

  const columns = useRunLogTableCol();
  const allRuns = useMemo(
    () =>
      data?.pages.reduce(
        (accl, page) => [...accl, ...page.items],
        [] as RunApi[]
      ) || [],
    [data]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    gotoPage,
    pageCount,
    setPageSize,
  } = useTable(
    {
      columns,
      data: allRuns,
      initialState: {
        pageIndex: 0,
        pageSize: 25,
      },
    },
    useSortBy,
    usePagination
  );

  const { data: runs, isFetched } = useRuns({ externalId, limit: 1 });

  const pipelineNotActivated = isFetched && runs?.pages?.[0].items.length === 0;

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

  return page.length === 0 ? (
    <DivFlex align="center" direction="column">
      <Graphic style={{ margin: '2rem 0' }} type="Search" />
      {reasonForNoRows}
      <p>&nbsp;</p>
    </DivFlex>
  ) : (
    <Wrapper>
      <StyledTable {...getTableProps()} className="cogs-table">
        <thead>
          {headerGroups.map((headerGroup: HeaderGroup<RunApi>) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((col: HeaderGroup<RunApi>) => {
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
          {page.map((row: Row<RunApi>) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell: Cell<RunApi>) => {
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
          itemsPerPage={state.pageSize as 25}
          setItemPerPage={(size) => setPageSize(size)}
          onPageChange={(page) => {
            gotoPage(page - 1);
          }}
          totalPages={pageCount}
        />
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
