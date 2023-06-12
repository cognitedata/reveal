import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styled from 'styled-components';

import { diagramPreview } from '@interactive-diagrams-app/routes/paths';
import { getUrlWithQueryParams } from '@interactive-diagrams-app/utils/config';

import { Body } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';

import FileItem from './FileItem';

type ItemsListProps = { diagrams?: FileInfo[] };

export default function ItemsList(props: ItemsListProps) {
  const navigate = useNavigate();
  const { workflowId, fileId } = useParams<{
    workflowId: string;
    fileId: string;
  }>();

  const { diagrams } = props;

  const selectedFileId = Number(fileId);
  const isDiagrams = Boolean(diagrams?.length);

  return (
    <ItemsListWrapper>
      {isDiagrams &&
        diagrams!.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            isSelected={selectedFileId === file.id}
            onClick={() =>
              navigate(
                getUrlWithQueryParams(diagramPreview.path(workflowId, file.id))
              )
            }
          />
        ))}
      {!isDiagrams && (
        <Body level={2} style={{ marginTop: '12px' }}>
          No file names match the query.
        </Body>
      )}
    </ItemsListWrapper>
  );
}

const ItemsListWrapper = styled.div`
  height: calc(100vh - 150px);
  width: 100%;
  margin-top: 12px;
  padding-right: 8px;
  overflow-y: scroll;
`;
