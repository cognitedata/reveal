import {
  DataSetItem,
  LinkedAssetItem,
  MetadataItem,
} from 'components/DetailsSidebar';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Timeseries } from '@cognite/sdk';
import { Icon } from '@cognite/cogs.js';
import dayjs from 'dayjs';
import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';

type MetadataListProps = {
  timeseriesId: number;
};

const defaultTranslations = makeDefaultTranslations(
  'Name',
  'Description',
  'External ID',
  'Updated',
  'Step',
  'Yes',
  'No',
  'ID',
  'Equipment Tag',
  'Data set',
  'Not set'
);

export const MetadataList = ({ timeseriesId }: MetadataListProps) => {
  const { data: timeseries, isLoading } = useCdfItem<Timeseries>('timeseries', {
    id: timeseriesId,
  });

  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'MetadataList').t,
  };

  if (isLoading) {
    return <Icon type="Loader" />;
  }

  return (
    <>
      <MetadataItem
        fallbackText={t['Not set']}
        label={t.Name}
        value={timeseries?.name}
        copyable
      />
      <MetadataItem
        fallbackText={t['Not set']}
        label={t.Description}
        value={timeseries?.description}
        copyable
      />
      <MetadataItem
        fallbackText={t['Not set']}
        label={t['External ID']}
        value={timeseries?.externalId}
        copyable
      />
      <DataSetItem
        label={t['Data set']}
        fallbackText={t['Not set']}
        timeseries={timeseries}
      />
      <MetadataItem
        fallbackText={t['Not set']}
        label={t.Updated}
        value={dayjs(timeseries?.lastUpdatedTime).format(
          'MMM D, YYYY HH:mm:ss'
        )}
      />
      <MetadataItem
        fallbackText={t['Not set']}
        label={t.Step}
        value={timeseries?.isStep ? t.Yes : t.No}
      />
      <MetadataItem
        fallbackText={t['Not set']}
        label={t.ID}
        value={timeseries?.id}
        copyable
      />
      <LinkedAssetItem
        label={t['Equipment Tag']}
        fallbackText={t['Not set']}
        timeseries={timeseries}
      />
    </>
  );
};
