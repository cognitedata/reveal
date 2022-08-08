import React, { useState } from 'react';
import { Timeseries, Asset, FileInfo } from '@cognite/sdk';
import {
  useCdfItem,
  useList,
  SdkResourceType,
} from '@cognite/sdk-react-query-hooks';
import {
  Icon,
  Button,
  Title,
  Badge,
  Colors,
  Body,
  A,
  Flex,
  Collapse,
} from '@cognite/cogs.js';

import {
  Loader,
  InfoGrid,
  InfoCell,
  ListItem,
  SpacedRow,
  ResourceIcons,
} from 'components';
import { TimeseriesSmallPreview } from 'containers/Timeseries';
import { FileSmallPreview } from 'containers/Files';
import { SelectableItemProps, SmallPreviewProps } from 'types';
import { useSelectionButton } from 'hooks/useSelection';

import { lightGrey, createLink } from 'utils';

const RowItem = ({
  style,
  title,
  onClick,
}: {
  style?: React.CSSProperties;
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
            paddingBottom: 8,
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
  hideTitle = false,
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
              type="ghost"
              icon="ArrowLeft"
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
      {!hideTitle && asset.name && (
        <InfoCell noPadding noBorders>
          <Title
            level={5}
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ResourceIcons.Asset />
            <A
              href={createLink(`/explore/asset/${assetId}`)}
              target="_blank"
              rel="noopener"
            >
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
            </A>
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
          <Collapse accordion ghost>
            <Collapse.Panel
              header={
                <ListItem
                  id="pnids"
                  style={{
                    marginBlock: '8px',
                    padding: 0,
                    width: '100%',
                    border: 0,
                  }}
                  title={
                    <Flex>
                      <Icon type="Document" style={{ marginRight: '4px' }} />
                      <Title level={6}>P&IDs</Title>
                    </Flex>
                  }
                  bordered={false}
                >
                  <Badge text={`${files.length}`} />
                </ListItem>
              }
            >
              {files.map(file => (
                <RowItem
                  onClick={() =>
                    setSelected({
                      type: 'files',
                      id: file.id,
                    })
                  }
                  key={file.id}
                  title={file.name}
                />
              ))}
            </Collapse.Panel>
          </Collapse>
        )}
        {timeseries && (
          <Collapse accordion ghost>
            <Collapse.Panel
              header={
                <ListItem
                  id="pnids"
                  style={{
                    marginBlock: '8px',
                    padding: 0,
                    width: '100%',
                    border: 0,
                  }}
                  title={
                    <Flex>
                      <Icon type="Timeseries" style={{ marginRight: '4px' }} />
                      <Title level={6}>Time series</Title>
                    </Flex>
                  }
                  bordered={false}
                >
                  <Badge text={`${timeseries.length}`} />
                </ListItem>
              }
            >
              {timeseries.map(time => (
                <RowItem
                  onClick={() =>
                    setSelected({
                      type: 'timeseries',
                      id: time.id,
                    })
                  }
                  key={time.id}
                  title={time.name || time.externalId || time.id}
                />
              ))}
            </Collapse.Panel>
          </Collapse>
        )}
      </InfoCell>
      {children}
    </InfoGrid>
  );
};
