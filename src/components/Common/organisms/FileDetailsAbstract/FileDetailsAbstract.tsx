import React from 'react';
import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';
import { Row } from 'antd';
import {
  InfoGrid,
  InfoCell,
  ListItem,
  CountLabel,
  SmallTitle,
} from 'components/Common';

import { FileInfo, Asset } from '@cognite/sdk';
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
  return (
    <InfoGrid className="file-info-grid" noBorders>
      {extras && (
        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
          {extras}
        </div>
      )}
      {file.name && (
        <InfoCell
          noBorders
          containerStyles={{ paddingTop: 0, paddingBottom: 0 }}
        >
          <SmallTitle style={{ display: 'flex', alignItems: 'center' }}>
            <IconWrapper>
              <Icon type="Document" />
            </IconWrapper>
            <span
              style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {file.name}
            </span>
          </SmallTitle>
        </InfoCell>
      )}

      {actions && (
        <InfoCell noBorders>
          <Row gutter={12} justify="start" className="button-row">
            {actions}
          </Row>
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
              <div style={{ display: 'flex' }}>
                <Icon type="Assets" style={{ marginRight: '4px' }} />
                <span>Detected Asset tags</span>
              </div>
            }
            bordered={false}
          >
            <CountLabel value={assets.length} />
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
              <div style={{ display: 'flex' }}>
                <Icon type="Assets" style={{ marginRight: '4px' }} />
                <span>Detected File tags</span>
              </div>
            }
            bordered={false}
          >
            <CountLabel value={files.length} />
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
