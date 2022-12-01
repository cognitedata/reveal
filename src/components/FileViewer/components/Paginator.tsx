/* eslint-disable @cognite/no-number-z-index */
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Pagination } from '@cognite/cogs.js';
import {
  ContainerConfig,
  ContainerType,
  getPdfCache,
} from '@cognite/unified-file-viewer';

export const Paginator = ({
  containerConfig,
  currentPage,
  onPageChange,
}: {
  containerConfig: ContainerConfig;
  currentPage: number;
  onPageChange: (page: number) => void;
}) => {
  const [totalPages, setTotalPages] = useState<number>(1);

  const handlePageChange = (page: number) => {
    onPageChange(page);
  };

  useEffect(() => {
    (async () => {
      if (
        containerConfig.type === ContainerType.DOCUMENT &&
        containerConfig.url
      ) {
        const pages = await getPdfCache().getPdfNumPages(containerConfig.url);
        setTotalPages(pages);
      } else {
        setTotalPages(1);
      }
    })();
  }, [containerConfig]);

  const showPaginator = useMemo(() => totalPages > 1, [totalPages]);

  return (
    <ToolBar>
      {showPaginator && (
        <Pagination
          current={currentPage}
          total={totalPages}
          onChange={handlePageChange}
        />
      )}
    </ToolBar>
  );
};

const ToolBar = styled.div`
  position: absolute;
  z-index: 100;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
`;
