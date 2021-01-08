import React, { useState } from 'react';
import { Timeseries, Asset, FileInfo } from '@cognite/sdk';
import {
  useCdfItem,
  useList,
  SdkResourceType,
} from '@cognite/sdk-react-query-hooks';
import { Icon, Button, Title, Badge, Colors, Body } from '@cognite/cogs.js';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import {
  Loader,
  InfoGrid,
  InfoCell,
  ListItem,
  SpacedRow,
  ResourceIcons,
} from 'lib/components';
import { TimeseriesSmallPreview } from 'lib/containers/Timeseries';
import { FileSmallPreview } from 'lib/containers/Files';
import { SelectableItemProps, SmallPreviewProps } from 'lib/CommonProps';
import { useSelectionButton } from 'lib/hooks/useSelection';

import { lightGrey } from 'lib/utils/Colors';
import { Link } from 'react-router-dom';
import { createLink } from 'lib/utils/URLUtils';

const LIST_ITEM_HEIGHT = 42;

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
            borderBottom: `1px solid ${lightGrey}`,
          }}
        >
          <span>{title}</span>
        </div>
      }
      bordered={false}
    />
  </div>
);
export const AssetSmallPreview = ({
  assetId,
  actions,
  extras,
  children,
  statusText,
  selectionMode = 'none',
  isSelected = false,
  onSelect = () => {},
}: {
  assetId: number;
} & SmallPreviewProps &
  Partial<SelectableItemProps>) => {
  const [selected, setSelected] = useState<
    { type: SdkResourceType; id: number } | undefined
  >(undefined);

  const selectionButton = useSelectionButton(
    selectionMode,
    { type: 'asset', id: assetId },
    isSelected,
    onSelect
  );

  const { data: asset, isFetched } = useCdfItem<Asset>(
    'assets',
    { id: assetId },
    {
      enabled: !!assetId,
    }
  );

  const { data: files } = useList<FileInfo>(
    'files',
    { filter: { assetSubtreeIds: [{ id: assetId }] }, limit: 10 },
    { enabled: isFetched }
  );
  const { data: timeseries } = useList<Timeseries>(
    'timeseries',
    { filter: { assetSubtreeIds: [{ id: assetId }] }, limit: 100 },
    { enabled: isFetched }
  );

  if (!isFetched) {
    return <Loader />;
  }
  if (!asset) {
    return <>Asset {assetId} not found!</>;
  }
  if (selected) {
    let content: React.ReactNode = null;
    if (selected.type === 'files') {
      content = <FileSmallPreview fileId={selected.id} />;
    }
    if (selected.type === 'timeseries') {
      content = <TimeseriesSmallPreview timeseriesId={selected.id} />;
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
      {asset.name && (
        <InfoCell noPadding noBorders>
          <Title
            level={5}
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ResourceIcons.Asset />
            <Link to={createLink(`/explore/asset/${assetId}`)}>
              <span
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  margin: '0 5px',
                }}
              >
                {asset.name}→
              </span>
            </Link>
          </Title>
        </InfoCell>
      )}

      <InfoCell noBorders>
        <SpacedRow>
          {selectionButton}
          {actions}
        </SpacedRow>
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
                      onClick={() =>
                        setSelected({
                          type: 'files',
                          id: files[index].id,
                        })
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
                      onClick={() =>
                        setSelected({
                          type: 'timeseries',
                          id: timeseries[index].id,
                        })
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
