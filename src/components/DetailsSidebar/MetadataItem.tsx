import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { Body, Icon } from '@cognite/cogs.js';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Asset, DataSet, Timeseries } from '@cognite/sdk';

type MetadataItemProps = {
  label: string;
  value?: any;
  copyable?: boolean;
  link?: string;
};

export const MetadataItem = ({
  label,
  value,
  copyable = false,
  link,
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
            <a href={link} target="_blank" rel="noreferrer">
              {value}
            </a>
          ) : (
            value
          )}
          {!!value && copyable && (
            <CopyIcon type={iconType} onClick={copyValue} />
          )}
        </Value>
      ) : (
        <em>Not set</em>
      )}
    </MetadataItemContainer>
  );
};

export const DataSetItem = ({ timeseries }: { timeseries?: Timeseries }) => {
  const { data: dataSet } = useCdfItem<DataSet>(
    'datasets',
    { id: timeseries?.dataSetId! },
    {
      enabled: Number.isFinite(timeseries?.dataSetId),
    }
  );

  return <MetadataItem label="Data set" value={dataSet?.name} link="/" />;
};

export const LinkedAssetItem = ({
  timeseries,
}: {
  timeseries?: Timeseries;
}) => {
  const { data: asset } = useCdfItem<Asset>(
    'assets',
    { id: timeseries?.assetId! },
    {
      enabled: Number.isFinite(timeseries?.assetId),
    }
  );

  return <MetadataItem label="Linked asset" value={asset?.name} link="/" />;
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
`;

const CopyIcon = styled(Icon)`
  color: ${(props: { type: 'Copy' | 'Checkmark' }) =>
    props.type === 'Copy'
      ? 'var(--cogs-link-primary-default)'
      : 'var(--cogs-success)'};
  margin: 0 5px;
  cursor: pointer;
`;
