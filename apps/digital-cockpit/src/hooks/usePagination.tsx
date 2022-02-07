import { useState } from 'react';
import { Pagination } from '@cognite/cogs.js';
import chunk from 'lodash/chunk';
import styled from 'styled-components';

const PaginationWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: right;
  button {
    margin: 0 4px;
    &:disabled {
      background: none;
      opacity: 0.3;
    }
  }
`;

const ITEMS_PER_PAGE = 10;

const usePagination = () => {
  const [pages, setPaginationPages] = useState<Record<string, number>>({});
  const setPage = (name: string, page: number) => {
    setPaginationPages((prev) => ({
      ...prev,
      [name]: page,
    }));
  };
  const resetPages = () => {
    setPaginationPages({});
  };
  const renderPagination = ({
    name,
    total,
  }: {
    name: string;
    total: number;
  }) => {
    if (total <= ITEMS_PER_PAGE) {
      return null;
    }

    const currentPage = pages[name] || 1;
    return (
      <PaginationWrapper>
        <Pagination
          current={currentPage}
          total={total}
          pageSize={ITEMS_PER_PAGE}
          simple
          onChange={(nextPage) => {
            setPage(name, nextPage);
          }}
        />
      </PaginationWrapper>
    );
  };
  const getPageData = (data: any[], name: string) => {
    return chunk(data, ITEMS_PER_PAGE)[pages[name] - 1 || 0] || [];
  };
  return { pages, setPage, renderPagination, getPageData, resetPages };
};

export default usePagination;
