import {
  CogniteAnnotation,
  convertEventsToAnnotations,
  getExternalIdFilter,
  getIdFilter,
} from '@cognite/annotations';
import {
  useCdfItem,
  useCdfItems,
  useList,
} from '@cognite/sdk-react-query-hooks';
import { Asset, CogniteEvent, FileInfo } from '@cognite/sdk';
import uniqBy from 'lodash/uniqBy';

export const useEventAnnotations = (fileId: number): CogniteAnnotation[] => {
  const { data: file, isFetched: fileFetched } = useCdfItem<FileInfo>('files', {
    id: fileId,
  });

  const { data: eventsById = [] } = useList<CogniteEvent>(
    'events',
    {
      limit: 1000,
      filter: !!file?.id ? getIdFilter(file.id) : undefined,
    },
    { enabled: fileFetched && !!file?.id }
  );
  const { data: eventsByExternalId = [] } = useList<CogniteEvent>(
    'events',
    {
      limit: 1000,
      filter: !!file?.externalId
        ? getExternalIdFilter(file.externalId)
        : undefined,
    },
    { enabled: fileFetched && file && !!file?.externalId }
  );

  const totalEvents = uniqBy(
    [...eventsById, ...eventsByExternalId],
    (el) => el.id
  );

  // To Get only the annotation of resource type assets
  const eventsWithAsset = totalEvents.filter(
    (item) => item.metadata?.['CDF_ANNOTATION_resource_type'] === 'asset'
  );

  const uniqueAssetsIdSet = new Set<number>();

  eventsWithAsset.forEach((ev) => {
    uniqueAssetsIdSet.add(Number(ev.metadata?.['CDF_ANNOTATION_resource_id']));
  });

  const { data: assets } = useCdfItems<Asset>(
    'assets',
    Array.from(uniqueAssetsIdSet).map((id) => ({ id })),
    false,
    {
      enabled: Boolean(eventsWithAsset.length),
    }
  );

  const labels = totalEvents.map((event) => {
    const foundAssets = assets?.find(
      (asset) =>
        `${asset.id}` === event.metadata?.['CDF_ANNOTATION_resource_id']
    );
    return foundAssets?.name || '';
  });

  // filter out events without box property if not conversion will fail

  const totalEventsWithBox = totalEvents.filter((ev) =>
    Boolean(ev?.metadata?.['CDF_ANNOTATION_box'])
  );

  return convertEventsToAnnotations(totalEventsWithBox).map((ev, idx) => ({
    ...ev,
    label: ev.label ? ev.label : labels[idx],
  }));
};
