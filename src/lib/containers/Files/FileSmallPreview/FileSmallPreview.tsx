import React, { useMemo } from 'react';
import { FileInfo, Asset } from '@cognite/sdk';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import styled from 'styled-components';
import { useCdfItem, useCdfItems } from '@cognite/sdk-react-query-hooks';
import { useSDK } from '@cognite/sdk-provider';
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
} from 'lib/components';
import { isFilePreviewable } from 'lib/utils/FileUtils';
import { useResourceActionsContext } from 'lib/context';
import { useSelectionButton } from 'lib/hooks/useSelection';
import { getIdParam } from 'lib/utils';
import { SmallPreviewProps } from 'lib/CommonProps';
import { FileDetails } from 'lib/containers/Files';
import { useAnnotations } from '../hooks';

export const FileSmallPreview = ({
  fileId,
  actions: propActions,
  extras,
  children,
  statusText,
}: {
  fileId: number;
} & SmallPreviewProps) => {
  const sdk = useSDK();
  const renderResourceActions = useResourceActionsContext();
  const selectionButton = useSelectionButton()({
    type: 'file',
    id: fileId,
  });

  const { data: file, isFetched, error } = useCdfItem<FileInfo>('files', {
    id: fileId,
  });

  const annotations = useAnnotations(fileId);

  const fileIds = annotations
    .map(a =>
      a.resourceType === 'file' ? a.resourceExternalId || a.resourceId : false
    )
    .filter(Boolean) as (number | string)[];
  const assetIds = annotations
    .map(a =>
      a.resourceType === 'asset' ? a.resourceExternalId || a.resourceId : false
    )
    .filter(Boolean) as (number | string)[];

  const actions = useMemo(() => {
    const items: React.ReactNode[] = [selectionButton];
    items.push(...(propActions || []));
    items.push(
      ...renderResourceActions({
        id: fileId,
        type: 'file',
      })
    );
    return items;
  }, [selectionButton, renderResourceActions, fileId, propActions]);

  const { data: files } = useCdfItems<FileInfo>(
    'files',
    uniq(fileIds).map(getIdParam),
    { enabled: fileIds.length > 0 }
  );
  const { data: assets } = useCdfItems<Asset>(
    'assets',
    uniq(assetIds).map(getIdParam),
    { enabled: assetIds.length > 0 }
  );

  const hasPreview = isFilePreviewable(file);

  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    return <ErrorFeedback error={error} />;
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
      {file.name && (
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

      {actions && (
        <InfoCell noBorders>
          <SpacedRow>{actions}</SpacedRow>
        </InfoCell>
      )}

      {hasPreview && (
        <InfoCell noBorders>
          <Preview>
            <CogniteFileViewer
              file={file}
              sdk={sdk}
              disableAutoFetch
              hideControls
              hideDownload
              hideSearch
              annotations={annotations}
              pagination="small"
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
                <Icon type="DataStudio" style={{ marginRight: '4px' }} />
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
                <Icon type="DataStudio" style={{ marginRight: '4px' }} />
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
