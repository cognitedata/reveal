import React from 'react';
import styled from 'styled-components';
import { Button, Overline, Icon, Body, Colors } from '@cognite/cogs.js';
import { CogniteAnnotation } from '@cognite/annotations';
import Highlighter from 'react-highlight-words';

import { Asset, FileInfo } from '@cognite/sdk';

const PageButton = styled(Button)`
  padding: 10px;
  width: 32px;
  height: 32px;
  margin-right: 8px;
  margin-bottom: 8px;
`;

const ItemWrapper = styled.div`
  margin-left: 12px;
  display: flex;
  align-items: stretch;
  flex-direction: row;
  padding-bottom: 12px;
  padding-top: 12px;
  border-bottom: 1px solid ${Colors['greyscale-grey5'].hex()};

  .details {
    margin-left: 8px;
    overflow: hidden;
    flex: 1;

    .cogs-body-1 {
      margin-bottom: 8px;
    }

    .cogs-body-2 {
      margin-bottom: 0px;
    }

    .button-row {
      margin-top: 8px;
      white-space: normal;
    }
  }
  .view-icon {
    opacity: 0;
    align-self: center;
    transition: 0.3s all;
    margin-left: 4px;
  }
  .view-icon svg {
    height: 12px;
    width: 12px;
  }
  && .cogs-body-1:hover {
    cursor: pointer;
    .view-icon {
      opacity: 1;
    }
  }
`;

const preparedPages = (
  pages: number[],
  selectPage: (page: number) => void,
  currentPage?: number
) => {
  const sortedPages = pages.sort((a, b) => a - b);
  if (
    sortedPages.length === 0 ||
    (sortedPages.length === 1 && sortedPages[0] === 1)
  ) {
    return null;
  }
  return (
    <>
      <Overline level="2" style={{ marginBottom: 8, marginTop: 6 }}>
        Located on Pages
      </Overline>
      <div className="button-row">
        {sortedPages.map((page) => (
          <PageButton
            key={`page-${page}`}
            onClick={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              selectPage(page);
            }}
            style={{}}
            type={page === currentPage ? 'primary' : 'secondary'}
          >
            {Number(page)}
          </PageButton>
        ))}
      </div>
    </>
  );
};

const resourceOccurences = (annotations: CogniteAnnotation[]) => {
  return annotations.length;
};

type FileViewerSidebarItemProps = {
  annotations: CogniteAnnotation[];
  selectPage: (page: number) => void;
  onItemClick?: () => void;
  currentPage?: number;
  query?: string;
};

const AssetItem = ({
  annotations,
  asset,
  selectPage,
  currentPage,
  onItemClick,
  query = '',
}: {
  asset?: Asset;
} & FileViewerSidebarItemProps) => {
  const pages = new Set<number>();
  annotations.forEach((item) => {
    if (item.page !== undefined) {
      pages.add(item.page);
    }
  });

  return (
    <ItemWrapper>
      <Icon type="Assets" />
      <div className="details">
        <Body onClick={onItemClick}>
          {asset ? (
            <Highlighter
              searchWords={query.split(' ')}
              textToHighlight={asset.name}
              autoEscape
            />
          ) : (
            'Loading...'
          )}
          <Icon className="cogs-icon view-icon" type="ArrowRight" />
        </Body>
        <Body
          level="3"
          style={{ color: Colors['greyscale-grey5'].hex() }}
        >{`${resourceOccurences(annotations)} occurences`}</Body>
        {asset && asset.description && (
          <Body level="2">
            <Highlighter
              searchWords={query.split(' ')}
              textToHighlight={asset.description}
              autoEscape
            />
          </Body>
        )}
        {preparedPages(Array.from(pages), selectPage, currentPage)}
      </div>
    </ItemWrapper>
  );
};

const FileItem = ({
  annotations,
  file,
  selectPage,
  currentPage,
  onItemClick,
  query = '',
}: {
  file?: FileInfo;
} & FileViewerSidebarItemProps) => {
  const pages = new Set<number>();
  annotations.forEach((item) => {
    if (item.page) {
      pages.add(item.page);
    }
  });

  return (
    <ItemWrapper>
      <Icon type="Document" />
      <div className="details">
        <Body onClick={onItemClick}>
          {file ? (
            <Highlighter
              searchWords={query.split(' ')}
              textToHighlight={file.name}
              autoEscape
            />
          ) : (
            'Loading...'
          )}
          <Icon className="cogs-icon view-icon" type="ArrowRight" />
        </Body>
        <Body
          level="3"
          style={{ color: Colors['greyscale-grey5'].hex() }}
        >{`${resourceOccurences(annotations)} occurences`}</Body>
        {file && file.mimeType && <Body level="2">{file.mimeType}</Body>}
        {preparedPages(Array.from(pages), selectPage, currentPage)}
      </div>
    </ItemWrapper>
  );
};

export { AssetItem, FileItem };
