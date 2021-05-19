import React, { useState } from 'react';
import * as CONST from 'src/constants/PaginationConsts';
import { TableDataItem } from '../../types';
import { Footer } from './Footer';
import { Header } from './Header';
import { Paginator } from './Paginator';

interface ISorterPaginationWrapperProps {
  data: TableDataItem[];
  totalCount: number;
  children: any;
  sorters?: {
    [key: string]: (data: TableDataItem[], reverse: boolean) => TableDataItem[];
  };
  pagination?: boolean;
}

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

  return (
    <>
      {header}
      {React.cloneElement(children, {
        sortKey,
        reverse,
        setSortKey,
        setReverse,
        selectable: true,
        data: getData(
          data,
          sortKey,
          sorters,
          reverse,
          pagination,
          currentPage,
          pageSize
        ),
        tableFooter,
      })}
      {pagination ? (
        <Paginator
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          setCurrentPage={setCurrentPage}
          setPageSize={setPageSize}
        />
      ) : null}
    </>
  );
};
