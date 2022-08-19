import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Body } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { getUrlWithQueryParams } from 'utils/config';
import { diagramPreview } from 'routes/paths';
import FileItem from './FileItem';

type ItemsListProps = { diagrams?: FileInfo[] };

export default function ItemsList(props: ItemsListProps) {
  const history = useHistory();
  const { workflowId, fileId } =
    useParams<{ workflowId: string; fileId: string }>();

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
              history.push(
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
