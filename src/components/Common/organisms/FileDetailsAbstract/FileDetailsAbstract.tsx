import React from 'react';
import styled from 'styled-components';
import { Icon, Title, Badge, Body, Colors } from '@cognite/cogs.js';
import { InfoGrid, InfoCell, ListItem, SpacedRow } from 'components/Common';
import { FileInfo, Asset } from 'cognite-sdk-v3';
import { useResourcesState } from 'context/ResourceSelectionContext';
import { FileInfoGrid } from './FileInfoGrid';

interface FileDetailsProps {
  file: FileInfo;
  imgPreview?: React.ReactNode;
  actions?: React.ReactNode[];
  children?: React.ReactNode;
  extras?: React.ReactNode;
  assets?: Asset[];
  files?: FileInfo[];
}

const IconWrapper = styled.span`
  background: #f5f5f5;
  padding: 5px;
  padding-bottom: 1px;
  border-radius: 4px;
  margin-right: 8px;
  vertical-align: -0.225em;
`;

export const FileDetailsAbstract = ({
  file,
  actions,
  children,
  imgPreview,
  assets,
  extras,
  files,
}: FileDetailsProps) => {
  const { resourcesState } = useResourcesState();

  const currentlyViewing = resourcesState.find(
    el => el.type === 'file' && el.state === 'active'
  );
  return (
    <InfoGrid className="file-info-grid" noBorders>
      {file.id === (currentlyViewing || {}).id && (
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
            <Icon type="Eye" style={{ marginRight: 8 }} /> Currently viewing
            file
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
            <IconWrapper>
              <Icon type="Document" />
            </IconWrapper>
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

      {imgPreview && <InfoCell noBorders>{imgPreview}</InfoCell>}

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
      <FileInfoGrid file={file} />
      {children}
    </InfoGrid>
  );
};

FileDetailsAbstract.FileInfoGrid = FileInfoGrid;
