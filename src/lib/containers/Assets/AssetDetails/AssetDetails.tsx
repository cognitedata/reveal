import React from 'react';
import { Asset } from '@cognite/sdk';
import { Title } from '@cognite/cogs.js';
import {
  DetailsItem,
  Loader,
  ErrorFeedback,
  TimeDisplay,
} from 'lib/components';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { formatMetadata } from 'lib/utils';

type Props = {
  id: number;
};
export const AssetDetails = ({ id }: Props) => {
  const { data: asset, error, isFetched } = useCdfItem<Asset>('assets', { id });

  if (error) {
    return <ErrorFeedback error={error} />;
  }

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <div>
      <Title level={4} style={{ marginTop: 12, marginBottom: 12 }}>
        Details
      </Title>
      <DetailsItem name="ID" value={asset?.id} />
      <DetailsItem name="Description" value={asset?.description} />
      <DetailsItem name="Source" value={asset?.source} />
      <DetailsItem name="External ID" value={asset?.externalId} />
      <DetailsItem name="Parent ID" value={asset?.parentId} />
      <DetailsItem
        name="Created at"
        value={asset ? <TimeDisplay value={asset.createdTime} /> : 'Loading...'}
      />
      <DetailsItem
        name="Updated at"
        value={
          asset ? <TimeDisplay value={asset.lastUpdatedTime} /> : 'Loading...'
        }
      />
      <Title level={4} style={{ marginTop: 12, marginBottom: 12 }}>
        Metadata
      </Title>
      {formatMetadata((asset && asset.metadata) ?? {}).map(el => (
        <DetailsItem key={el.key} name={el.key} value={el.value} />
      ))}
    </div>
  );
};
