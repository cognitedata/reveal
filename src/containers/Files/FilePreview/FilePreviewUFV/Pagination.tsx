import React, { useState } from 'react';
import { Pagination as CogsPagination } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useEffect } from 'react';
import { ContainerType, getPdfCache } from '@cognite/unified-file-viewer';
import { DocumentContainerProps } from '@cognite/unified-file-viewer/dist/core/containers/DocumentContainer';
import { ImageContainerProps } from '@cognite/unified-file-viewer/dist/core/containers/ImageContainer';

export const Pagination = ({
  container,
  onPageChange,
  children,
}: {
  container: DocumentContainerProps | ImageContainerProps;
  onPageChange: (pageNumber: number) => void;
  children: any;
}) => {
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    (async () => {
      if (container.type === ContainerType.DOCUMENT && container.url) {
        const pdfNumPages = await getPdfCache().getPdfNumPages(container.url);
        setNumPages(pdfNumPages);
      }
    })();
  }, [container.type, container.url]);

  if (numPages > 1) {
    return (
      <>
        {children}
        <ToolBar>
          <CogsPagination
            totalPages={numPages}
            onPageChange={onPageChange}
            hideItemsPerPage
            size="default"
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
  bottom: 10px;
  right: 140px;
`;
