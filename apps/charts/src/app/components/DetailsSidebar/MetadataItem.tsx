import { useState } from 'react';

import styled from 'styled-components/macro';

import { createLink } from '@cognite/cdf-utilities';
import { Body, Button, Colors } from '@cognite/cogs.js';
import { Asset, DataSet, Timeseries } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

type MetadataItemProps = {
  label: string;
  value?: any;
  copyable?: boolean;
  link?: string;
  fallbackText: string;
};

export const MetadataItem = ({
  label,
  value,
  copyable = false,
  link,
  fallbackText = 'Not set',
}: MetadataItemProps) => {
  const [iconType, setIconType] = useState<'Copy' | 'Checkmark'>('Copy');

  const copyValue = async () => {
    await navigator.clipboard.writeText(value);
    setIconType('Checkmark');
    setTimeout(() => setIconType('Copy'), 3000);
  };

  return (
    <MetadataItemContainer>
      <Label>{label}</Label>
      {value ? (
        <Value>
          {link ? (
            <ExternalLink href={link} target="_blank" rel="noreferrer">
              {value}
            </ExternalLink>
          ) : (
            value
          )}
          {!!value && copyable && (
            <CopyButton
              type="ghost-accent"
              size="small"
              icon={iconType}
              onClick={copyValue}
            />
          )}
        </Value>
      ) : (
        <em>{fallbackText}</em>
      )}
    </MetadataItemContainer>
  );
};

export const DataSetItem = ({
  timeseries,
  label = 'Data set',
  fallbackText = 'Not set',
}: {
  timeseries?: Timeseries;
  label: string;
  fallbackText: string;
}) => {
  const { data: dataSet } = useCdfItem<DataSet>(
    'datasets',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore will not be undefined as this query is enabled only when timeseries?.dataSetId is Finite Number
    { id: timeseries?.dataSetId },
    {
      enabled: Number.isFinite(timeseries?.dataSetId),
    }
  );
  const link = createLink(`/data-sets/data-set/${timeseries?.dataSetId}`);

  return (
    <MetadataItem
      fallbackText={fallbackText}
      label={label}
      value={dataSet?.name}
      link={link}
    />
  );
};

export const LinkedAssetItem = ({
  timeseries,
  label = 'Equipment Tag',
  fallbackText = 'Not set',
}: {
  timeseries?: Timeseries;
  label: string;
  fallbackText: string;
}) => {
  const { data: asset } = useCdfItem<Asset>(
    'assets',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore will not be undefined as this query is enabled only when timeseries?.assetId is Finite Number
    { id: timeseries?.assetId },
    {
      enabled: Number.isFinite(timeseries?.assetId),
    }
  );
  const link = createLink(`/explore/asset/${timeseries?.assetId}`);

  return (
    <MetadataItem
      fallbackText={fallbackText}
      label={label}
      value={asset?.name}
      link={link}
    />
  );
};

const MetadataItemContainer = styled.div`
  margin: 10px 0;
`;

const Label = styled(Body)`
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Value = styled(Body)`
  font-size: 16px;
  color: var(--cogs-text-secondary);
  font-weight: 300;
  word-wrap: break-word;
`;

const CopyButton = styled(Button)`
  color: ${(props: { icon: 'Copy' | 'Checkmark' }) =>
    props.icon === 'Copy'
      ? Colors['surface--action--strong--default']
      : Colors['text-icon--status-success']};
  margin: 0 5px;
  cursor: pointer;
`;

const ExternalLink = styled.a`
  color: var(--cogs-link-primary-default);
`;
