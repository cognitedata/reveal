import React from 'react';

import styled from 'styled-components';

import noop from 'lodash/noop';

import { createLink } from '@cognite/cdf-utilities';
import { Body, toast, Chip, Flex, Link } from '@cognite/cogs.js';
import { DataSet, Asset } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import {
  convertResourceType,
  COPIED_TEXT,
  DASH,
  DATA_EXPLORATION_COMPONENT,
  ResourceType,
  useClipboard,
  useMetrics,
} from '@data-exploration-lib/core';
import {
  DetailedMapping,
  useRootAssetQuery,
} from '@data-exploration-lib/domain-layer';

import { CopyButton } from '../Buttons';

import { RootAssetWrapper } from './elements';
import {
  ThreeDModelCellDropdown,
  ThreeDModelCellLink,
} from './ThreeDModelCell';

type DetailsItemProps = {
  name: string;
  value?: React.ReactNode;
  copyable?: boolean;
  link?: string;
};
// If you enable the copyable props, Make sure to add the Unique key props  to the component wherever it is being used
export const DetailsItem = ({
  name,
  value,
  copyable = false,
  link,
}: DetailsItemProps) => {
  const clipboardValue =
    copyable && (typeof value === 'string' || typeof value === 'number')
      ? value
      : '';

  const { hasCopied, onCopy } = useClipboard();
  const trackUsage = useMetrics();

  const handleOnClickCopy = () => {
    onCopy(clipboardValue.toString());
    toast.success(COPIED_TEXT);
    trackUsage(DATA_EXPLORATION_COMPONENT.CLICK.COPY_TO_CLIPBOARD, { name });
  };

  return (
    <Flex>
      <DetailsItemContainer>
        <Body level={2} strong>
          {name}
        </Body>
        <Spacer />

        {Boolean(value) &&
          (link ? (
            <Link
              href={link}
              size="small"
              target="_blank"
              className="details-item-value"
            >
              {value}
            </Link>
          ) : (
            <Body level={2} className="details-item-value">
              {value}
            </Body>
          ))}
        {!value && <MutedBody level={2}>{DASH}</MutedBody>}
      </DetailsItemContainer>
      {copyable && Boolean(value) && (
        <ButtonWrapper visible={true}>
          <CopyButton onClick={handleOnClickCopy} hasCopied={hasCopied} />
        </ButtonWrapper>
      )}
    </Flex>
  );
};

export const DataSetItem = ({
  id,
  type,
}: {
  id: number;
  type: ResourceType;
}) => {
  const { data: item, isFetched } = useCdfItem<{ dataSetId?: number }>(
    convertResourceType(type),
    { id }
  );

  const { data: dataSet } = useCdfItem<DataSet>(
    'datasets',
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    { id: item?.dataSetId! },
    {
      enabled: isFetched && Number.isFinite(item?.dataSetId),
    }
  );

  if (isFetched && item) {
    return (
      <DetailsItem
        name="Data set"
        value={dataSet?.name || item?.dataSetId}
        link={
          item.dataSetId
            ? createLink(`/data-sets/data-set/${item.dataSetId}`)
            : undefined
        }
      />
    );
  }

  return null;
};

export const AssetItem = ({ id }: { id: number }) => {
  const { data: item, isFetched } = useCdfItem<{ name?: string }>('assets', {
    id,
  });

  if (isFetched && item) {
    return (
      <DetailsItem
        name="Linked asset(s)"
        value={item.name}
        link={createLink(`/explore/asset/${id}`)}
        copyable
      />
    );
  }

  return null;
};

export const AssetsItem = ({
  assetIds = [],
  linkId,
  type,
}: {
  assetIds?: number[];
  linkId: number;
  type: ResourceType;
}) => {
  if (!assetIds || assetIds?.length === 0) {
    return <DetailsItem name="Linked asset(s)" />;
  }

  if (assetIds.length === 1) {
    return <AssetItem id={assetIds[0]} />;
  }

  const assetsLink = createLink(
    window.location.pathname.includes('/search')
      ? `/explore/search/${type}/${linkId}/asset`
      : `/explore/${type}/${linkId}/asset`
  );
  const assetsLinkText = `${assetIds.length} assets`;
  return (
    <DetailsItem
      name="Linked asset(s)"
      value={assetsLinkText}
      link={assetsLink}
    />
  );
};

export const RootAssetItem = ({
  assetId,
  onClick = noop,
}: {
  assetId?: number;
  onClick: (rootAsset: Asset) => void;
}) => {
  const { data: rootAsset } = useRootAssetQuery(assetId);
  const { onCopy, hasCopied } = useClipboard();
  const rootAssetName = rootAsset?.name || '';

  const handleCopy = () => {
    onCopy(rootAssetName);
    toast.success(COPIED_TEXT);
  };

  const onClickHandler = () => {
    rootAsset && onClick(rootAsset);
  };

  return (
    <DetailsItem
      name="Root Asset"
      value={
        <Flex wrap="wrap" gap={8} justifyContent="flex-end">
          <RootAssetWrapper onClick={onClickHandler}>
            {rootAssetName}
          </RootAssetWrapper>
          <CopyButton onClick={handleCopy} hasCopied={hasCopied} />
        </Flex>
      }
    />
  );
};

export const LabelsItem = ({ labels = [] }: { labels?: string[] }) => {
  const { onCopy } = useClipboard();
  const handleCopy = (value: string) => {
    onCopy(value);
    toast.success(COPIED_TEXT);
  };
  if (labels.length > 0) {
    return (
      <DetailsItem
        name="Labels"
        value={
          <Flex wrap="wrap" gap={8} justifyContent="flex-end">
            {labels.map((label) => (
              <Chip
                type="default"
                label={label}
                action={{ onClick: () => handleCopy(label), icon: 'Copy' }}
                size="small"
                key={label}
              />
            ))}
          </Flex>
        }
      />
    );
  }
  return <DetailsItem name="Labels" />;
};

export const ThreeDModelItem = ({
  assetId,
  mappings,
}: {
  assetId: number;
  mappings: DetailedMapping[];
}) => {
  return (
    <Flex>
      <DetailsItemContainer>
        <Body level={2} strong>
          {mappings.length === 1 ? 'Linked 3D model' : 'Linked 3D models'}
        </Body>
        <Spacer />

        {mappings.length === 1 ? (
          <ThreeDModelCellLink assetId={assetId} mapping={mappings[0]} />
        ) : (
          <Body level={2}>{mappings.length} models</Body>
        )}
      </DetailsItemContainer>
      <ButtonWrapper visible={mappings.length > 1}>
        <ThreeDModelCellDropdown assetId={assetId} mappings={mappings} />
      </ButtonWrapper>
    </Flex>
  );
};

const DetailsItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  margin-bottom: 8px;
  padding-top: 5px;
  align-items: flex-start;

  .details-item-value {
    word-break: break-word;
  }
`;

const Spacer = styled.div`
  flex: 1;
  border-bottom: var(--cogs-border--muted) 1px dashed;
  margin: 4px 8px;
  min-width: 60px;
  height: 14px;
`;

const MutedBody = styled(Body)`
  color: var(--cogs-text-icon--muted);
`;

const ButtonWrapper = styled.div<{ visible?: boolean }>`
  margin-left: 8px;
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  visibility: ${({ visible }) => (visible ? 'unset' : 'hidden')};
`;
