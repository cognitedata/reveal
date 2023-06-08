import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon, Button } from '@cognite/cogs.js';
import { Row } from 'antd';
import {
  InfoGrid,
  InfoCell,
  SmallTitle,
  ListItem,
  CountLabel,
} from '@interactive-diagrams-app/components/Common';
import { Asset, FileInfo, Timeseries } from '@cognite/sdk';
import { AssetBreadcrumb } from '@cognite/data-exploration';

interface AssetDetailsProps {
  asset: Asset;
  files?: FileInfo[];
  timeseries?: Timeseries[];
  actions?: React.ReactNode[];
  extras?: React.ReactNode;
  children?: React.ReactNode;
  timeseriesPreview?: (
    timeseries: Timeseries,
    listItem: React.ReactNode
  ) => React.ReactNode;
  filePreview?: (file: FileInfo, listItem: React.ReactNode) => React.ReactNode;
}

const IconWrapper = styled.span`
  background: #f5f5f5;
  padding: 5px;
  padding-bottom: 1px;
  border-radius: 4px;
  margin-right: 8px;
  vertical-align: -0.225em;
`;

export const AssetDetailsAbstract = ({
  asset,
  files,
  timeseries,
  actions,
  extras,
  children,
  timeseriesPreview,
  filePreview,
}: AssetDetailsProps) => {
  const [selectedView, setSelectedView] = useState<
    'pnids' | 'timeseries' | undefined
  >();

  if (selectedView === 'pnids' && files) {
    return (
      <InfoGrid className="asset-info-grid" noBorders>
        {asset.name && (
          <InfoCell
            containerStyles={{ paddingTop: 0, paddingBottom: 0 }}
            noBorders
          >
            <SmallTitle style={{ display: 'flex', alignItems: 'center' }}>
              <IconWrapper>
                <Icon type="Assets" />
              </IconWrapper>
              <span
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {asset.name}
              </span>
            </SmallTitle>
          </InfoCell>
        )}
        <InfoCell noBorders>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button onClick={() => setSelectedView(undefined)} type="secondary">
              BACK
            </Button>
            <p style={{ marginLeft: '16px', marginBottom: 0 }}>
              <strong>ALL FILES</strong>
            </p>
          </div>
        </InfoCell>
        <InfoCell noBorders>
          {files.map((file) => {
            const content = (
              <ListItem
                key={file.id}
                style={{
                  padding: 0,
                  width: '100%',
                  border: 'none',
                  marginBottom: '8px',
                }}
                title={
                  <div style={{ display: 'flex' }}>
                    <Icon type="Document" style={{ marginRight: '4px' }} />
                    <span>{file.name}</span>
                  </div>
                }
                bordered={false}
              />
            );

            if (filePreview) {
              return filePreview(file, content);
            }
            return content;
          })}
        </InfoCell>
        {children}
      </InfoGrid>
    );
  }

  if (selectedView === 'timeseries' && timeseries) {
    return (
      <InfoGrid className="asset-info-grid" noBorders>
        {asset.name && (
          <InfoCell
            containerStyles={{ paddingTop: 0, paddingBottom: 0 }}
            noBorders
          >
            <SmallTitle style={{ display: 'flex', alignItems: 'center' }}>
              <IconWrapper>
                <Icon type="Document" />
              </IconWrapper>
              <span
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {asset.name}
              </span>
            </SmallTitle>
          </InfoCell>
        )}
        <InfoCell noBorders>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button onClick={() => setSelectedView(undefined)} type="secondary">
              BACK
            </Button>
            <p style={{ marginLeft: '16px', marginBottom: 0 }}>
              <strong>ALL TIME SERIES</strong>
            </p>
          </div>
        </InfoCell>
        <InfoCell noBorders>
          {timeseries.map((ts) => {
            const content = (
              <ListItem
                key={ts.id}
                style={{
                  padding: 0,
                  width: '100%',
                  border: 'none',
                  marginBottom: '8px',
                }}
                title={
                  <div style={{ display: 'flex' }}>
                    <Icon type="Timeseries" style={{ marginRight: '4px' }} />
                    <span>{ts.name}</span>
                  </div>
                }
                bordered={false}
              />
            );
            if (timeseriesPreview) {
              return timeseriesPreview(ts, content);
            }
            return content;
          })}
        </InfoCell>
        {children}
      </InfoGrid>
    );
  }
  return (
    <InfoGrid className="asset-info-grid" noBorders>
      {extras && (
        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
          {extras}
        </div>
      )}
      {asset.name && (
        <InfoCell
          containerStyles={{ paddingTop: 0, paddingBottom: 0 }}
          noBorders
        >
          <SmallTitle style={{ display: 'flex', alignItems: 'center' }}>
            <IconWrapper>
              <Icon type="Assets" />
            </IconWrapper>
            <span
              style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {asset.name}
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

      <InfoCell noBorders>
        <p>LOCATION</p>
        <AssetBreadcrumb assetId={asset.id} />
      </InfoCell>

      <InfoCell noBorders>
        <p>CONTENT</p>
        {files && (
          <ListItem
            id="pnids"
            onClick={() => setSelectedView('pnids')}
            style={{
              padding: 0,
              width: '100%',
              border: 'none',
              marginBottom: '8px',
            }}
            title={
              <div style={{ display: 'flex' }}>
                <Icon type="Document" style={{ marginRight: '4px' }} />
                <span>Diagrams</span>
              </div>
            }
            bordered={false}
          >
            <CountLabel value={files.length} />
          </ListItem>
        )}
        {timeseries && (
          <ListItem
            id="timeseries"
            onClick={() => setSelectedView('timeseries')}
            style={{
              padding: 0,
              width: '100%',
              border: 'none',
              marginBottom: '8px',
            }}
            title={
              <div style={{ display: 'flex' }}>
                <Icon type="Timeseries" style={{ marginRight: '4px' }} />
                <span>Time series</span>
              </div>
            }
            bordered={false}
          >
            <CountLabel value={timeseries.length} />
          </ListItem>
        )}
      </InfoCell>
      {children}
    </InfoGrid>
  );
};
