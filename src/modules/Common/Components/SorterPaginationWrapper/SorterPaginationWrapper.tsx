import React, { useMemo, useState } from 'react';
import * as CONST from 'src/constants/PaginationConsts';
import styled from 'styled-components';
import { PaginationProps } from 'src/modules/Common/Components/FileTable/types';
import { TableDataItem } from '../../types';
import { Footer } from './Footer';
import { Header } from './Header';
import { Paginator } from './Paginator';

type ISorterPaginationWrapperProps = {
  children: (tableProps: PaginationProps<TableDataItem>) => React.ReactNode;
} & {
  data: TableDataItem[];
  totalCount: number;
  sorters?: {
    [key: string]: (data: TableDataItem[], reverse: boolean) => TableDataItem[];
  };
  pagination?: boolean;
};

const getData = (
  data: TableDataItem[],
  sortKey?: string,
  sorters?: {
    [key: string]: (data: TableDataItem[], reverse: boolean) => TableDataItem[];
  },
  reverse?: boolean,
  pagination?: boolean,
  pageNumber?: number,
  pageSize?: number
): TableDataItem[] => {
  let tableData = data;
  // if sorting enabled
  if (sorters && sortKey && reverse !== undefined) {
    const sorter = sorters[sortKey];
    tableData = sorter ? sorter(data, reverse) : data;
  }
  // if pagination enabled
  if (pagination && pageNumber && pageSize) {
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    tableData = tableData.slice(startIndex, endIndex);
  }
  return tableData;
};

export const SorterPaginationWrapper = (
  props: ISorterPaginationWrapperProps
) => {
  const { data, totalCount, sorters, children, pagination } = props;
  const [reverse, setReverse] = useState(false);
  const [sortKey, setSortKey] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(CONST.DEFAULT_PAGE_SIZE);
  const fetchedCount = data.length;
  const totalPages = Math.ceil(fetchedCount / pageSize);

  const header =
    totalCount > fetchedCount ? (
      <Header fetchedCount={fetchedCount} totalCount={totalCount} />
    ) : null;

  const tableFooter =
    totalCount > fetchedCount && totalPages === currentPage ? (
      <Footer fetchedCount={fetchedCount} totalCount={totalCount} />
    ) : null;

  const pagedData = useMemo(() => {
    return getData(
      data,
      sortKey,
      sorters,
      reverse,
      pagination,
      currentPage,
      pageSize
    );
  }, [data, sortKey, sorters, reverse, pagination, currentPage, pageSize]);

  return (
    <Container>
      <HeaderContainer>{header}</HeaderContainer>
      <TableContainer>
        {children({
          sortKey,
          reverse,
          setSortKey,
          setReverse,
          data: pagedData,
          tableFooter,
        })}
      </TableContainer>
      <PaginationContainer>
        {pagination ? (
          <Paginator
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
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
  grid-template-rows: max-content auto max-content;
  grid-template-columns: 100%;
  height: 100%;
  width: 100%;
`;

const TableContainer = styled.div`
  height: inherit;
`;
const HeaderContainer = styled.div`
  height: inherit;
`;
const PaginationContainer = styled.div`
  height: inherit;
`;
