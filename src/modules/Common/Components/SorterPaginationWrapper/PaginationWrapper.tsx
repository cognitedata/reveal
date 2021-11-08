import React, { useMemo } from 'react';
import * as CONST from 'src/constants/PaginationConsts';
import { TableDataItem } from 'src/modules/Common/types';
import styled from 'styled-components';
import {
  SortPaginateControls,
  PaginatedTableProps,
} from 'src/modules/Common/Components/FileTable/types';
import { Footer } from './Footer';
import { Paginator } from './Paginator';

const getPage = (
  data: TableDataItem[],
  pagination?: boolean,
  pageNumber?: number,
  pageSize?: number
): TableDataItem[] => {
  let tableData = data;

  // if pagination enabled
  if (pagination) {
    if (pageNumber && pageSize) {
      if (pageNumber > 0 && pageSize > 0) {
        const startIndex = (pageNumber - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        tableData = tableData.slice(startIndex, endIndex);
      }
    } else {
      const startIndex = 0;
      const endIndex = startIndex + CONST.DEFAULT_PAGE_SIZE;
      tableData = tableData.slice(startIndex, endIndex);
    }
  }
  return tableData;
};

type PaginationWrapperProps = {
  data: TableDataItem[];
  totalCount: number;
  pagination?: boolean;
  sortPaginateControls: SortPaginateControls;
  isLoading: boolean;
  children: (tableProps: PaginatedTableProps<TableDataItem>) => React.ReactNode;
};

export const PaginationWrapper = ({
  data,
  totalCount,
  pagination,
  sortPaginateControls,
  isLoading,
  children,
}: PaginationWrapperProps) => {
  const {
    sortKey,
    reverse,
    currentPage,
    pageSize,
    setSortKey,
    setReverse,
    setCurrentPage,
    setPageSize,
  } = sortPaginateControls;
  const fetchedCount = data.length;
  const totalPages =
    pageSize > 0
      ? Math.ceil(fetchedCount / pageSize)
      : Math.ceil(fetchedCount / CONST.DEFAULT_PAGE_SIZE);

  const tableFooter =
    totalCount > fetchedCount && totalPages === currentPage ? (
      <Footer fetchedCount={fetchedCount} totalCount={totalCount} />
    ) : null;

  const pagedData = useMemo(() => {
    return getPage(data, pagination, currentPage, pageSize);
  }, [data, pagination, currentPage, pageSize]);

  if (!pagination) {
    return (
      <>
        {children({
          sortKey,
          reverse,
          setSortKey,
          setReverse,
          data: pagedData,
          tableFooter: null,
          fetchedCount,
        })}
      </>
    );
  }

  return (
    <Container>
      <TableContainer>
        {children({
          sortKey,
          reverse,
          setSortKey,
          setReverse,
          data: pagedData,
          tableFooter,
          fetchedCount,
        })}
      </TableContainer>
      <PaginationContainer>
        {pagination && !isLoading ? (
          <Paginator
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            setPageSize={setPageSize}
          />
        ) : null}
      </PaginationContainer>
    </Container>
  );
};

const Container = styled.div`
  display: grid;
  grid-template-rows: auto max-content;
  grid-template-columns: 100%;
  height: 100%;
  width: 100%;
`;

const TableContainer = styled.div`
  height: inherit;
`;

const PaginationContainer = styled.div`
  height: inherit;
`;
