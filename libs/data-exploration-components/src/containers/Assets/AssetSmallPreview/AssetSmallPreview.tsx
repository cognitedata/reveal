import React, { useState } from 'react';

import styled from 'styled-components';

import { EmptyState, Loader } from '@data-exploration/components';

import { createLink } from '@cognite/cdf-utilities';
import {
  Icon,
  Button,
  Title,
  Chip,
  Body,
  Flex,
  Collapse,
  Link,
} from '@cognite/cogs.js';
import { Timeseries, Asset, FileInfo } from '@cognite/sdk';
import {
  useCdfItem,
  useList,
  SdkResourceType,
} from '@cognite/sdk-react-query-hooks';

import {
  InfoCell,
  InfoGrid,
  ListItem,
  ResourceIcons,
  SpacedRow,
} from '../../../components';
import { useSelectionButton } from '../../../hooks';
import { SelectableItemProps, SmallPreviewProps } from '../../../types';
import { lightGrey } from '../../../utils';
import { FileSmallPreview } from '../../Files';
import { TimeseriesSmallPreview } from '../../Timeseries';

const RowItemTitleContainer = styled.div`
  display: flex;
  padding-bottom: 8px;
  border-bottom: 1px solid ${lightGrey};
`;
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
        <RowItemTitleContainer>
          <span>{title}</span>
        </RowItemTitleContainer>
      }
      bordered={false}
    />
  </div>
);

const BackButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;
const CenteredBody = styled(Body)`
  align-items: center;
  display: flex;
`;
const ExtrasContainer = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
`;
const AssetTitle = styled(Title)`
  display: flex;
  align-items: center;
`;
const AssetNameLabel = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 5px;
`;

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
    return (
      <EmptyState isLoading={false} title={`Asset ${assetId} not found`} />
    );
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
          <BackButtonContainer>
            <Button
              onClick={() => setSelected(undefined)}
              type="ghost"
              icon="ArrowLeft"
            >
              BACK TO {asset.name.toLocaleUpperCase()}
            </Button>
          </BackButtonContainer>
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
            color: 'var(--cogs-text-icon--muted)',
          }}
        >
          <CenteredBody level={2} strong>
            {statusText}
          </CenteredBody>
        </InfoCell>
      )}
      {extras && <ExtrasContainer>{extras}</ExtrasContainer>}
      {!hideTitle && asset.name && (
        <InfoCell noPadding noBorders>
          <AssetTitle level={5}>
            <ResourceIcons.Asset />
            <Link
              href={createLink(`/explore/asset/${assetId}`)}
              target="_blank"
            >
              <AssetNameLabel>{asset.name}→</AssetNameLabel>
            </Link>
          </AssetTitle>
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
                      <StyledIcon type="Document" />
                      <Title level={6}>P&IDs</Title>
                    </Flex>
                  }
                  bordered={false}
                >
                  <Chip label={`${files.length}`} />
                </ListItem>
              }
            >
              {files.map((file) => (
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
                      <StyledIcon type="Timeseries" />
                      <Title level={6}>Time series</Title>
                    </Flex>
                  }
                  bordered={false}
                >
                  <Chip label={`${timeseries.length}`} />
                </ListItem>
              }
            >
              {timeseries.map((time) => (
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

const StyledIcon = styled(Icon)`
  margin-right: 4px;
`;
