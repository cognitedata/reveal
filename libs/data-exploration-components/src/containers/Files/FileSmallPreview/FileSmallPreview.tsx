import React from 'react';

import styled from 'styled-components';

import { Loader } from '@data-exploration/components';
import { FileInfo } from '@data-exploration/containers';
import uniq from 'lodash/uniq';

import { Icon, Title, Chip, Body, Colors } from '@cognite/cogs.js';
import { FileInfo as FileInfoType, Asset, CogniteError } from '@cognite/sdk';
import { useCdfItem, useCdfItems } from '@cognite/sdk-react-query-hooks';

import { getIdParam } from '@data-exploration-lib/core';
import { useAnnotations } from '@data-exploration-lib/domain-layer';

import {
  ErrorFeedback,
  InfoGrid,
  InfoCell,
  ListItem,
  SpacedRow,
  ResourceIcons,
} from '../../../components';
import { useSelectionButton } from '../../../hooks';
import { SmallPreviewProps, SelectableItemProps } from '../../../types';
import { isFilePreviewable } from '../../../utils';
import { FilePreview } from '../FilePreview';

export const FileSmallPreview = ({
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
  } = useCdfItem<FileInfoType>('files', {
    id: fileId,
  });

  const selectionButton = useSelectionButton(
    selectionMode,
    { type: 'file', id: fileId },
    isSelected,
    onSelect
  );
  const annotations = useAnnotations(fileId).data;

  const fileIds = annotations
    .map((annotation) => {
      if (annotation.annotationType === 'diagrams.FileLink') {
        // NOTE: This is due to too wide types in the SDK
        // @ts-expect-error
        return annotation.data.fileRef.id;
      }

      return false;
    })
    .filter((fileId) => Boolean(fileId));

  const assetIds = annotations
    .map((annotation) => {
      if (annotation.annotationType === 'diagrams.AssetLink') {
        // NOTE: This is due to too wide types in the SDK
        // @ts-expect-error
        return annotation.data.assetRef.id;
      }

      return false;
    })
    .filter((assetId) => Boolean(assetId));

  const { data: files } = useCdfItems<FileInfoType>(
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
            color: Colors['decorative--grayscale--600'],
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
            <FilePreview
              applicationId="FileSmallPreview"
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
                <StyledIcon type="Assets" />
                <span>Detected asset tags</span>
              </div>
            }
            bordered={false}
          >
            <Chip label={`${assets.length}`} />
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
                <StyledIcon type="Assets" />
                <span>Detected file tags</span>
              </div>
            }
            bordered={false}
          >
            <Chip label={`${files.length}`} />
          </ListItem>
        )}
        {!assets && !files && <p>No Tags Detected</p>}
      </InfoCell>
      <FileInfo file={file} />
      {children}
    </InfoGrid>
  );
};

const Preview = styled.div`
  height: 300px;
`;

const StyledIcon = styled(Icon)`
  margin-right: 4px;
`;
