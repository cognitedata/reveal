/* eslint-disable @cognite/no-number-z-index */
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { FileInfo } from '@cognite/sdk';
import { Pagination } from '@cognite/cogs.js';
import { getPdfCache } from '@cognite/unified-file-viewer';
import { MULTI_PAGE_DOCUMENT_TYPES } from '../constants';

export const Paginator = ({
  file,
  fileUrl,
  currentPage,
  onPageChange,
}: {
  file: FileInfo | undefined;
  fileUrl: string | undefined;
  currentPage: number;
  onPageChange: (page: number) => void;
}) => {
  const [totalPages, setTotalPages] = useState<number>(1);

  const { mimeType = '', name = '' } = file ?? {};
  const query = mimeType + name.slice(0, name.lastIndexOf('.'));
  const isMultiPageDocument = MULTI_PAGE_DOCUMENT_TYPES.some((el) =>
    query.includes(el)
  );

  const handlePageChange = (page: number) => {
    onPageChange(page);
  };

  useEffect(() => {
    (async () => {
      if (fileUrl && isMultiPageDocument) {
        const pages = await getPdfCache().getPdfNumPages(fileUrl);
        setTotalPages(pages);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl]);

  const showPaginator = useMemo(
    () => isMultiPageDocument && totalPages > 1,
    [isMultiPageDocument, totalPages]
  );

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
