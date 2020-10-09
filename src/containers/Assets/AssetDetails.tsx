import React from 'react';
import { Asset } from '@cognite/sdk';
import { Title } from '@cognite/cogs.js';
import {
  DetailsItem,
  Loader,
  ErrorFeedback,
  TimeDisplay,
} from 'components/Common';
import { DescriptionList } from '@cognite/gearbox/dist/components/DescriptionList';
import { useCdfItem } from 'hooks/sdk';

const formatMetadata = (metadata: { [key: string]: any }) =>
  Object.keys(metadata).reduce(
    (agg, cur) => ({
      ...agg,
      [cur]: String(metadata[cur]) || '',
    }),
    {}
  );

type Props = {
  id: number;
};
export default function AssetDetails({ id }: Props) {
  const { data: asset, error, isFetched } = useCdfItem<Asset>('assets', { id });

  if (error) {
    return <ErrorFeedback error={error} />;
  }

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <>
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
      <DescriptionList
        valueSet={formatMetadata((asset && asset.metadata) ?? {})}
      />
    </>
  );
}
