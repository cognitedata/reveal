import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon, Button, Title, Badge, Colors, Body } from '@cognite/cogs.js';
import { InfoGrid, InfoCell, ListItem, ButtonRow } from 'components/Common';
import { Asset, FileInfo, Timeseries } from 'cognite-sdk-v3';
import { AssetBreadcrumb } from '@cognite/gearbox';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { ResourceType } from 'modules/sdk-builder/types';
import { useResourcesState } from 'context/ResourceSelectionContext';

const LIST_ITEM_HEIGHT = 42;

interface AssetDetailsProps {
  asset: Asset;
  files?: FileInfo[];
  timeseries?: Timeseries[];
  actions?: React.ReactNode[];
  extras?: React.ReactNode;
  children?: React.ReactNode;
  timeseriesPreview?: (timeseries: Timeseries) => React.ReactNode;
  filePreview?: (file: FileInfo) => React.ReactNode;
}

const IconWrapper = styled.span`
  background: #f5f5f5;
  padding: 5px;
  padding-bottom: 1px;
  border-radius: 4px;
  margin-right: 8px;
  vertical-align: -0.225em;
`;

const RowItem = ({
  style,
  title,
  onClick,
}: {
  style: React.CSSProperties;
  title: string | number;
  onClick?: () => void;
}) => (
  <div style={style}>
    <ListItem
      onClick={onClick}
      style={{
        padding: `0px 12px`,
        paddingTop: 8,
        marginLeft: 8,
      }}
      title={
        <div
          style={{
            display: 'flex',
            height: 32,
            borderBottom: `1px solid ${Colors['greyscale-grey3'].hex()}`,
          }}
        >
          <span>{title}</span>
        </div>
      }
      bordered={false}
    />
  </div>
);

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
  const resourcesState = useResourcesState();

  const currentlyViewing = resourcesState.find(
    el => el.type === 'asset' && el.state === 'active'
  );
  const [selected, setSelected] = useState<
    { type: ResourceType; id: number } | undefined
  >(undefined);
  if (selected) {
    let content: React.ReactNode = null;
    if (
      files &&
      filePreview &&
      selected.type === 'files' &&
      files.some(el => el.id === selected.id)
    ) {
      const file = files.find(el => el.id === selected.id)!;
      content = filePreview(file);
    }
    if (
      timeseries &&
      timeseriesPreview &&
      selected.type === 'timeseries' &&
      timeseries.some(el => el.id === selected.id)
    ) {
      const ts = timeseries.find(el => el.id === selected.id)!;
      content = timeseriesPreview(ts);
    }
    return (
      <InfoGrid noBorders>
        <InfoCell noBorders>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              onClick={() => setSelected(undefined)}
              type="secondary"
              icon="ArrowLeft"
              variant="ghost"
            >
              BACK TO {asset.name.toLocaleUpperCase()}
            </Button>
          </div>
        </InfoCell>
        {content}
      </InfoGrid>
    );
  }
  return (
    <InfoGrid noBorders>
      {asset.id === (currentlyViewing || {}).id && (
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
            <Icon type="Eye" style={{ marginRight: 8 }} /> Currently Viewing
            Asset
          </Body>
        </InfoCell>
      )}
      {extras && (
        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
          {extras}
        </div>
      )}
      {asset.name && (
        <InfoCell noPadding noBorders>
          <Title level={5} style={{ display: 'flex', alignItems: 'center' }}>
            <IconWrapper>
              <Icon type="DataStudio" />
            </IconWrapper>
            <span
              style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {asset.name}
            </span>
          </Title>
        </InfoCell>
      )}

      {actions && (
        <InfoCell noBorders>
          <ButtonRow>{actions}</ButtonRow>
        </InfoCell>
      )}

      <InfoCell noBorders noPadding>
        <p>LOCATION</p>
        <AssetBreadcrumb assetId={asset.id} />
      </InfoCell>

      <InfoCell noBorders>
        <p>CONTENT</p>
        {files && (
          <>
            <ListItem
              id="pnids"
              style={{
                padding: 0,
                marginBottom: '8px',
                marginTop: '8px',
              }}
              title={
                <div style={{ display: 'flex' }}>
                  <Icon type="Document" style={{ marginRight: '4px' }} />
                  <Title level={6}>P&IDs</Title>
                </div>
              }
              bordered={false}
            >
              <Badge text={`${files.length}`} />
            </ListItem>
            <AutoSizer disableHeight>
              {({ width }) => (
                <List
                  height={Math.min(files.length * LIST_ITEM_HEIGHT, 150)}
                  itemCount={files.length}
                  itemSize={LIST_ITEM_HEIGHT}
                  width={width}
                >
                  {({ index, style }) => (
                    <RowItem
                      onClick={
                        filePreview
                          ? () =>
                              setSelected({
                                type: 'files',
                                id: files[index].id,
                              })
                          : undefined
                      }
                      key={files[index].id}
                      style={style}
                      title={files[index].name}
                    />
                  )}
                </List>
              )}
            </AutoSizer>
          </>
        )}
        {timeseries && (
          <>
            <ListItem
              id="timeseries"
              style={{
                padding: 0,
                marginBottom: '8px',
                marginTop: '8px',
              }}
              title={
                <div style={{ display: 'flex' }}>
                  <Icon type="Timeseries" style={{ marginRight: '4px' }} />
                  <Title level={6}>Time series</Title>
                </div>
              }
              bordered={false}
            >
              <Badge text={`${timeseries.length}`} />
            </ListItem>
            <AutoSizer disableHeight>
              {({ width }) => (
                <List
                  height={Math.min(timeseries.length * LIST_ITEM_HEIGHT, 150)}
                  itemCount={timeseries.length}
                  itemSize={LIST_ITEM_HEIGHT}
                  width={width}
                >
                  {({ index, style }) => (
                    <RowItem
                      onClick={
                        timeseriesPreview
                          ? () =>
                              setSelected({
                                type: 'timeseries',
                                id: timeseries[index].id,
                              })
                          : undefined
                      }
                      key={timeseries[index].id}
                      style={style}
                      title={
                        timeseries[index].name ||
                        timeseries[index].externalId ||
                        timeseries[index].id
                      }
                    />
                  )}
                </List>
              )}
            </AutoSizer>
          </>
        )}
      </InfoCell>
      {children}
    </InfoGrid>
  );
};
