import {
  DataSetItem,
  LinkedAssetItem,
  MetadataItem,
} from 'components/DetailsSidebar';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Timeseries } from '@cognite/sdk';
import { Icon } from '@cognite/cogs.js';
import dayjs from 'dayjs';

type MetadataListProps = {
  timeseriesId: number;
};

export const MetadataList = ({ timeseriesId }: MetadataListProps) => {
  const { data: timeseries, isLoading } = useCdfItem<Timeseries>('timeseries', {
    id: timeseriesId,
  });

  if (isLoading) {
    return <Icon type="Loader" />;
  }

  return (
    <>
      <MetadataItem label="Name" value={timeseries?.name} copyable />
      <MetadataItem
        label="Description"
        value={timeseries?.description}
        copyable
      />
      <MetadataItem
        label="External ID"
        value={timeseries?.externalId}
        copyable
      />
      <DataSetItem timeseries={timeseries} />
      <MetadataItem
        label="Updated"
        value={dayjs(timeseries?.lastUpdatedTime).format(
          'MMM D, YYYY HH:mm:ss'
        )}
      />
      <MetadataItem label="Step" value={timeseries?.isStep ? 'Yes' : 'No'} />
      <MetadataItem label="ID" value={timeseries?.id} copyable />
      <LinkedAssetItem timeseries={timeseries} />
    </>
  );
};
