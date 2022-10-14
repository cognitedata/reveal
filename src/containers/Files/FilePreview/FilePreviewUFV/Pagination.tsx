import React, { useState } from 'react';
import { Pagination as CogsPagination } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useEffect } from 'react';
import { getPdfCache } from '@cognite/unified-file-viewer';

export const Pagination = ({
  pdfUrl,
  onPageChange,
  children,
}: {
  pdfUrl: string;
  onPageChange: (pageNumber: number) => void;
  children: any;
}) => {
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    (async () => {
      if (pdfUrl) {
        const pdfNumPages = await getPdfCache().getPdfNumPages(pdfUrl);
        setNumPages(pdfNumPages);
      }
    })();
  }, [pdfUrl]);

  if (numPages > 1) {
    return (
      <>
        {children}
        <ToolBar>
          <CogsPagination
            totalPages={numPages}
            onPageChange={onPageChange}
            hideItemsPerPage
            size="small"
          />
        </ToolBar>
      </>
    );
  }
  return <>{children}</>;
};

const ToolBar = styled.div`
  position: absolute;
  z-index: 100;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
`;
