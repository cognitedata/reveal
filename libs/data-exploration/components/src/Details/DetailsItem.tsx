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
  getSearchParams,
  getSearchParamsWithJourneyAndSelectedTab,
  ResourceType,
  useClipboard,
  useMetrics,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  DetailedMapping,
  useGetLabelName,
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
  hideCopyButton?: boolean; // keep this true if a copy button is included with the value
  direction?: 'row' | 'column';
};
// If you enable the copyable props, Make sure to add the Unique key props  to the component wherever it is being used
export const DetailsItem = ({
  name,
  value,
  copyable = false,
  link,
  hideCopyButton = false,
  direction = 'row',
}: DetailsItemProps) => {
  const { t } = useTranslation();

  const clipboardValue =
    copyable && (typeof value === 'string' || typeof value === 'number')
      ? value
      : '';

  const { hasCopied, onCopy } = useClipboard();
  const trackUsage = useMetrics();

  const handleOnClickCopy = () => {
    onCopy(clipboardValue.toString());
    toast.success(t('COPIED', COPIED_TEXT));
    trackUsage(DATA_EXPLORATION_COMPONENT.CLICK.COPY_TO_CLIPBOARD, { name });
  };

  return (
    <Flex>
      <DetailsItemContainer $direction={direction}>
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
      {!hideCopyButton && (
        <ButtonWrapper visible={copyable && Boolean(value)}>
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
  const { t } = useTranslation();

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
        name={t('DATA_SET', 'Data set')}
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

export const AssetItem = ({
  id,
  direction,
}: {
  id: number;
  direction?: 'row' | 'column';
}) => {
  const { t } = useTranslation();

  const { data: item, isFetched } = useCdfItem<{ name?: string }>('assets', {
    id,
  });

  if (isFetched && item) {
    return (
      <DetailsItem
        name={t('LINKED_ASSETS', 'Linked asset(s)')}
        value={item.name}
        link={createLink(`/explore/asset/${id}`)}
        direction={direction}
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
  direction,
}: {
  assetIds?: number[];
  linkId: number;
  type: ResourceType;
  direction?: 'row' | 'column';
}) => {
  const { t } = useTranslation();

  if (!assetIds || assetIds?.length === 0) {
    return (
      <DetailsItem
        name={t('LINKED_ASSETS', 'Linked asset(s)')}
        direction={direction}
      />
    );
  }

  if (assetIds.length === 1) {
    return <AssetItem id={assetIds[0]} direction={direction} />;
  }

  const searchParams = getSearchParamsWithJourneyAndSelectedTab(
    {
      id: linkId,
      type,
    },
    'asset'
  );
  const assetsLink = createLink(
    `/explore/search/${type}`,
    getSearchParams(searchParams)
  );
  const assetsLinkText = `${assetIds.length} assets`;
  return (
    <DetailsItem
      name={t('LINKED_ASSETS', 'Linked asset(s)')}
      value={assetsLinkText}
      link={assetsLink}
      direction={direction}
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
  const { t } = useTranslation();
  const { data: rootAsset } = useRootAssetQuery(assetId);
  const { onCopy, hasCopied } = useClipboard();
  const rootAssetName = rootAsset?.name || '';

  const handleCopy = () => {
    onCopy(rootAssetName);
    toast.success(t('COPIED', COPIED_TEXT));
  };

  const onClickHandler = () => {
    rootAsset && onClick(rootAsset);
  };

  return (
    <DetailsItem
      name={t('ROOT_ASSET', 'Root Asset')}
      value={
        <Flex wrap="wrap" gap={8} justifyContent="flex-end">
          <RootAssetWrapper onClick={onClickHandler}>
            {rootAssetName}
          </RootAssetWrapper>
          <CopyButton onClick={handleCopy} hasCopied={hasCopied} />
        </Flex>
      }
      hideCopyButton
    />
  );
};

export const LabelsItem = ({ labels = [] }: { labels?: string[] }) => {
  const { t } = useTranslation();
  const { onCopy } = useClipboard();
  const getLabelName = useGetLabelName();

  const handleCopy = (value: string) => {
    onCopy(value);
    toast.success(t('COPIED', COPIED_TEXT));
  };

  if (labels.length > 0) {
    return (
      <DetailsItem
        name={t('LABELS', 'Labels')}
        value={
          <Flex wrap="wrap" gap={8} justifyContent="flex-end">
            {labels.map((label) => {
              const labelName = getLabelName(label);

              return (
                <Chip
                  type="default"
                  label={labelName}
                  action={{
                    onClick: () => handleCopy(labelName),
                    icon: 'Copy',
                  }}
                  size="small"
                  key={label}
                />
              );
            })}
          </Flex>
        }
      />
    );
  }
  return <DetailsItem name={t('LABELS', 'Labels')} />;
};

export const ThreeDModelItem = ({
  assetId,
  mappings,
}: {
  assetId: number;
  mappings: DetailedMapping[];
}) => {
  const { t } = useTranslation();
  return (
    <Flex>
      <DetailsItemContainer>
        <Body level={2} strong>
          {t(
            'LINKED_3D_MODEL',
            mappings.length === 1 ? 'Linked 3D model' : 'Linked 3D models',
            { count: mappings.length }
          )}
        </Body>
        <Spacer />

        {mappings.length === 1 ? (
          <ThreeDModelCellLink assetId={assetId} mapping={mappings[0]} />
        ) : (
          <Body level={2}>
            {t('MODELS_WITH_COUNT', '{{count}} models', {
              count: mappings.length,
            })}
          </Body>
        )}
      </DetailsItemContainer>
      <ButtonWrapper visible={mappings.length > 1}>
        <ThreeDModelCellDropdown assetId={assetId} mappings={mappings} />
      </ButtonWrapper>
    </Flex>
  );
};

const DetailsItemContainer = styled.div<{ $direction?: 'row' | 'column' }>`
  display: flex;
  flex-direction: ${({ $direction = 'row' }) => $direction};
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
