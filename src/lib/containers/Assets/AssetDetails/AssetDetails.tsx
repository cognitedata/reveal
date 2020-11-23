import React from 'react';
import { Asset, DataSet } from '@cognite/sdk';
import {
  TimeDisplay,
  DetailsTabGrid,
  DetailsTabItem,
  Label,
} from 'lib/components';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

type Props = {
  asset: Asset;
  datasetLink?: string;
};

export const AssetDetails = ({ asset, datasetLink }: Props) => {
  const { data: dataset } = useCdfItem<DataSet>(
    'datasets',
    { id: asset?.dataSetId || 0 },
    { enabled: !!asset && !!asset?.dataSetId }
  );

  return (
    <DetailsTabGrid>
      <DetailsTabItem name="Description" value={asset?.description} />
      <DetailsTabItem name="External ID" value={asset?.externalId} copyable />
      <DetailsTabItem name="ID" value={asset?.id} copyable />
      <DetailsTabItem
        name="Data set"
        value={dataset?.name}
        link={datasetLink}
      />
      <DetailsTabItem
        name="Created at"
        value={asset ? <TimeDisplay value={asset.createdTime} /> : 'Loading...'}
      />
      <DetailsTabItem
        name="Updated at"
        value={
          asset ? <TimeDisplay value={asset.lastUpdatedTime} /> : 'Loading...'
        }
      />
      <DetailsTabItem
        name="Labels"
        value={
          asset?.labels
            ? asset?.labels.map(label => <Label>{label.externalId}</Label>)
            : undefined
        }
      />
    </DetailsTabGrid>
  );
};
