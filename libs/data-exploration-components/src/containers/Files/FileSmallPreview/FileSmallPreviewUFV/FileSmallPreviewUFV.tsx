import { useEventAnnotations } from '@data-exploration-lib/domain-layer';
import React from 'react';
import { FileInfo, Asset, CogniteError } from '@cognite/sdk';
import styled from 'styled-components';
import { useCdfItem, useCdfItems } from '@cognite/sdk-react-query-hooks';
import { Icon, Title, Badge, Body, Colors } from '@cognite/cogs.js';
import uniq from 'lodash/uniq';
import {
  Loader,
  ErrorFeedback,
  InfoGrid,
  InfoCell,
  ListItem,
  SpacedRow,
  ResourceIcons,
} from '@data-exploration-components/components';
import {
  isFilePreviewable,
  getIdParam,
} from '@data-exploration-components/utils';
import {
  SmallPreviewProps,
  SelectableItemProps,
} from '@data-exploration-components/types';
import {
  FileDetails,
  FilePreviewUFV,
} from '@data-exploration-components/containers/Files';
import { useSelectionButton } from '@data-exploration-components/hooks/useSelection';

export const FileSmallPreviewUFV = ({
  fileId,
  actions,
  extras,
  children,
  statusText,
  selectionMode = 'none',
  isSelected = false,
  onSelect = () => {},
  hideTitle = false,
}: {
  fileId: number;
} & SmallPreviewProps &
  Partial<SelectableItemProps>) => {
  const {
    data: file,
    isFetched,
    error,
  } = useCdfItem<FileInfo>('files', {
    id: fileId,
  });

  const selectionButton = useSelectionButton(
    selectionMode,
    { type: 'file', id: fileId },
    isSelected,
    onSelect
  );
  const annotations = useEventAnnotations(fileId);

  const fileIds = annotations
    .map((annotation) =>
      annotation.resourceType === 'file'
        ? annotation.resourceExternalId || annotation.resourceId
        : false
    )
    .filter((fileIdOrExternalId): fileIdOrExternalId is number | string =>
      Boolean(fileIdOrExternalId)
    );
  const assetIds = annotations
    .map((annotation) =>
      annotation.resourceType === 'asset'
        ? annotation.resourceExternalId || annotation.resourceId
        : false
    )
    .filter((assetIdOrExternalId): assetIdOrExternalId is number | string =>
      Boolean(assetIdOrExternalId)
    );

  const { data: files } = useCdfItems<FileInfo>(
    'files',
    uniq(fileIds).map(getIdParam),
    false,
    { enabled: fileIds.length > 0 }
  );
  const { data: assets } = useCdfItems<Asset>(
    'assets',
    uniq(assetIds).map(getIdParam),
    false,
    { enabled: assetIds.length > 0 }
  );

  const hasPreview = isFilePreviewable(file);

  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    return <ErrorFeedback error={error as CogniteError} />;
  }
  if (!file) {
    return <>File {fileId} not found!</>;
  }

  return (
    <InfoGrid className="file-info-grid" noBorders>
      {statusText && (
        <InfoCell
          noBorders
          containerStyles={{
            display: 'flex',
            alignItems: 'center',
            color: Colors['greyscale-grey6'].hex(),
          }}
        >
          <Body
            level={2}
            strong
            style={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            {statusText}
          </Body>
        </InfoCell>
      )}
      {extras && (
        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
          {extras}
        </div>
      )}
      {!hideTitle && file.name && (
        <InfoCell noBorders noPadding>
          <Title level={5} style={{ display: 'flex', alignItems: 'center' }}>
            <ResourceIcons.File />
            <span
              style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {file.name}
            </span>
          </Title>
        </InfoCell>
      )}

      <InfoCell noBorders>
        <SpacedRow>
          {selectionButton}
          {actions}
        </SpacedRow>
      </InfoCell>

      {hasPreview && (
        <InfoCell noBorders>
          <Preview>
            <FilePreviewUFV
              applicationId={'FileSmallPreviewUFV'}
              id={`file-small-preview-${file.id}`}
              fileId={file.id}
              creatable={false}
              contextualization={false}
              showSideBar={false}
              enableToolTips={false}
              enableZoomToAnnotation={false}
              showControls={false}
            />
          </Preview>
        </InfoCell>
      )}

      <InfoCell noBorders>
        <p>CONTENT</p>
        {assets && (
          <ListItem
            style={{
              padding: 0,
              width: '100%',
              border: 'none',
              marginBottom: '8px',
            }}
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Icon type="Assets" style={{ marginRight: '4px' }} />
                <span>Detected asset tags</span>
              </div>
            }
            bordered={false}
          >
            <Badge text={`${assets.length}`} />
          </ListItem>
        )}

        {files && (
          <ListItem
            style={{
              padding: 0,
              width: '100%',
              border: 'none',
              marginBottom: '8px',
            }}
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Icon type="Assets" style={{ marginRight: '4px' }} />
                <span>Detected file tags</span>
              </div>
            }
            bordered={false}
          >
            <Badge text={`${files.length}`} />
          </ListItem>
        )}
        {!assets && !files && <p>No Tags Detected</p>}
      </InfoCell>
      <FileDetails file={file} />
      {children}
    </InfoGrid>
  );
};

const Preview = styled.div`
  height: 300px;
`;
