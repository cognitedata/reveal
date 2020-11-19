import React from 'react';
import { Asset, DataSet } from '@cognite/sdk';
import { Body, Colors } from '@cognite/cogs.js';
import { Loader, ErrorFeedback, TimeDisplay } from 'lib/components';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import Typography from 'antd/lib/typography';
import styled from 'styled-components';

const { Text } = Typography;

type Props = {
  id: number;
};

export const AssetDetailsItem = ({
  name,
  value,
  copyable = false,
}: {
  name: string;
  value?: any;
  copyable?: boolean;
}) => {
  return (
    <div style={{ display: 'inline-block', width: '50%', margin: '15px 0' }}>
      <Body level={2}>{name}</Body>
      <Text copyable={!!value && copyable}>{value || <em>Not set</em>}</Text>
    </div>
  );
};

export const AssetDetails = ({ id }: Props) => {
  const { data: asset, error, isFetched } = useCdfItem<Asset>('assets', { id });

  const { data: dataset } = useCdfItem<DataSet>(
    'datasets',
    { id: asset?.dataSetId || 0 },
    { enabled: !!asset && !!asset?.dataSetId }
  );

  if (error) {
    return <ErrorFeedback error={error} />;
  }

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <div>
      <AssetDetailsItem name="Description" value={asset?.description} />
      <AssetDetailsItem name="External ID" value={asset?.externalId} copyable />
      <AssetDetailsItem name="Data set" value={dataset?.name} />
      <AssetDetailsItem name="ID" value={asset?.id} copyable />
      <AssetDetailsItem
        name="Created at"
        value={asset ? <TimeDisplay value={asset.createdTime} /> : 'Loading...'}
      />
      <AssetDetailsItem
        name="Updated at"
        value={
          asset ? <TimeDisplay value={asset.lastUpdatedTime} /> : 'Loading...'
        }
      />
      <AssetDetailsItem
        name="Labels"
        value={
          asset?.labels
            ? asset?.labels.map(label => <Label>{label.externalId}</Label>)
            : undefined
        }
      />
    </div>
  );
};

const Label = styled.span`
  background-color: ${Colors['greyscale-grey3'].hex()};
  padding: 5px;
  margin-right: 5px;
  border-radius: 4px;
`;
