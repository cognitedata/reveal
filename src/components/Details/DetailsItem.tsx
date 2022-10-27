import React from 'react';
import { Body, A, toast, Label, Flex, Button } from '@cognite/cogs.js';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { convertResourceType, ResourceType } from 'types';
import { DataSet } from '@cognite/sdk';
import { createLink } from '@cognite/cdf-utilities';
import styled from 'styled-components';
import { useClipboard } from 'hooks';

type DetailsItemProps = {
  name: string;
  value?: React.ReactNode;
  copyable?: boolean;
  link?: string;
};

export const DetailsItem = ({
  name,
  value,
  copyable = false,
  link,
}: DetailsItemProps) => {
  const { hasCopied, onCopy } = useClipboard(
    copyable && typeof value === 'string' ? value : ''
  );

  return (
    <Flex>
      <DetailsItemContainer>
        <Body level={2} strong>
          {name}
        </Body>
        <Spacer />

        {Boolean(value) &&
          (link ? (
            <A href={link} target="_blank" rel="noopener">
              {value}
            </A>
          ) : (
            <Body level={2}>{value}</Body>
          ))}
        {!Boolean(value) && <MutedBody level={2}>No description</MutedBody>}
      </DetailsItemContainer>
      <ButtonWrapper visible={copyable && Boolean(value)}>
        <Button
          type="ghost"
          icon={hasCopied ? 'Checkmark' : 'Copy'}
          disabled={hasCopied}
          onClick={() => {
            onCopy();
            toast.success('Copied to clipboard');
          }}
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
          <Flex wrap="wrap" gap={8}>
            {labels.map(label => (
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

const DetailsItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  margin-bottom: 16px;
  padding-top: 5px;
  align-items: flex-start;
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
  padding-bottom: 10px;
  visibility: ${({ visible }) => (visible ? 'unset' : 'hidden')};
`;
