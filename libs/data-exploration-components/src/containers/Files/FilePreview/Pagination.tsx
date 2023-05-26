import styled from 'styled-components';

import { Pagination as CogsPagination } from '@cognite/cogs.js';

export const Pagination = ({
  currentPage,
  numPages,
  onPageChange,
}: {
  currentPage: number;
  numPages: number;
  onPageChange: (pageNumber: number) => void;
}) => {
  if (numPages <= 1) {
    return <></>;
  }
  return (
    <ToolBar>
      <CogsPagination
        currentPage={currentPage}
        totalPages={numPages}
        onPageChange={onPageChange}
        hideItemsPerPage
        size="small"
        elevated
      />
    </ToolBar>
  );
};

const ToolBar = styled.div`
  position: absolute;
  isolation: isolate;
  left: 50%;
  -ms-transform: translate(-50%);
  transform: translate(-50%);
  bottom: 10px;
`;
