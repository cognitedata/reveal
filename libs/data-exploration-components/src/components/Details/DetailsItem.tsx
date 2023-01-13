import React from 'react';
import { Body, A, toast, Label, Flex, Button } from '@cognite/cogs.js';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import {
  convertResourceType,
  ResourceType,
} from '@data-exploration-components/types';
import { DataSet } from '@cognite/sdk';
import { createLink } from '@cognite/cdf-utilities';
import styled from 'styled-components';
import { useClipboard } from '@data-exploration-components/hooks';
import { DASH } from '@data-exploration-components/utils';
import { DetailedMapping } from '@data-exploration-lib/domain-layer';
import {
  ThreeDModelCellDropdown,
  ThreeDModelCellLink,
} from '@data-exploration-components/containers/Assets/AssetTable/ThreeDModelCell';
import { useMetrics } from '@data-exploration-components/hooks/useMetrics';
import { DATA_EXPLORATION_COMPONENT } from '@data-exploration-components/constants/metrics';

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
    toast.success('Copied to clipboard');
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
            <A
              href={link}
              target="_blank"
              rel="noopener"
              className="details-item-value"
            >
              {value}
            </A>
          ) : (
            <Body level={2} className="details-item-value">
              {value}
            </Body>
          ))}
        {!value && <MutedBody level={2}>{DASH}</MutedBody>}
      </DetailsItemContainer>
      <ButtonWrapper visible={copyable && Boolean(value)}>
        <Button
          type="ghost"
          size="small"
          icon={hasCopied ? 'Checkmark' : 'Copy'}
          disabled={hasCopied}
          onClick={handleOnClickCopy}
          aria-label="Copy"
        />
      </ButtonWrapper>
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
  assetIds,
  linkId,
  type,
}: {
  assetIds: number[] | undefined;
  linkId: number;
  type: ResourceType;
}) => {
  if (!assetIds) {
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

export const LabelsItem = ({ labels = [] }: { labels?: string[] }) => {
  if (labels.length > 0) {
    return (
      <DetailsItem
        name="Labels"
        value={
          <Flex wrap="wrap" gap={8} justifyContent="flex-end">
            {labels.map((label) => (
              <Label variant="unknown" size="medium" key={label}>
                {label}
              </Label>
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
  margin-bottom: 16px;
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
  visibility: ${({ visible }) => (visible ? 'unset' : 'hidden')};
`;
