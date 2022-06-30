import {
  useCdfItem,
  useCdfItems,
  useList,
} from '@cognite/sdk-react-query-hooks';
import {
  FileInfo,
  CogniteEvent,
  ExternalLabelDefinition,
  FileChangeUpdate,
  Asset,
} from '@cognite/sdk';
import {
  getIdFilter,
  getExternalIdFilter,
  convertEventsToAnnotations,
} from '@cognite/annotations';
import uniqBy from 'lodash/uniqBy';
import { useMutation, useQueryClient } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { sleep } from 'utils';
import { notification } from 'antd';

export const useAnnotations = (fileId: number) => {
  const { data: file, isFetched: fileFetched } = useCdfItem<FileInfo>('files', {
    id: fileId,
  });

  const { data: eventsById = [] } = useList<CogniteEvent>(
    'events',
    {
      limit: 1000,
      filter: getIdFilter(file?.id!),
    },
    { enabled: fileFetched && file ? !!file?.id : false }
  );
  const { data: eventsByExternalId = [] } = useList<CogniteEvent>(
    'events',
    {
      limit: 1000,
      filter: getExternalIdFilter(file?.externalId!),
    },
    { enabled: fileFetched && file && !!file?.externalId }
  );

  const totalEvents = uniqBy(
    [...eventsById, ...eventsByExternalId],
    el => el.id
  );

  // To Get only the annotation of resource type assets
  const eventsWithAsset = totalEvents.filter(
    item => item.metadata?.CDF_ANNOTATION_resource_type === 'assets'
  );

  const uniqueAssetsIdSet = new Set<number>();

  eventsWithAsset.forEach(ev => {
    uniqueAssetsIdSet.add(Number(ev.metadata?.CDF_ANNOTATION_resource_id));
  });

  const { data: assets } = useCdfItems<Asset>(
    'assets',
    Array.from(uniqueAssetsIdSet).map(id => ({ id })),
    false,
    {
      enabled: Boolean(eventsWithAsset.length),
    }
  );

  const labels = totalEvents.map(event => {
    const foundAssets = assets?.find(
      asset => `${asset.id}` === event.metadata?.CDF_ANNOTATION_resource_id
    );
    return foundAssets?.name || '';
  });

  const result = convertEventsToAnnotations(totalEvents).map((ev, idx) => ({
    ...ev,
    label: ev.label ? ev.label : labels[idx],
  }));

  return result;
};

export const isFileApproved = (file: FileInfo) =>
  file.labels?.find(label => label.externalId === INTERACTIVE_LABEL.externalId);

export const isFilePending = (file: FileInfo) =>
  file.labels?.find(label => label.externalId === PENDING_LABEL.externalId);

export const useReviewFile = (fileId?: number) => {
  const client = useQueryClient();
  const sdk = useSDK();

  const { data: file } = useCdfItem<FileInfo>('files', { id: fileId ?? 0 });

  const doesLabelExist = async (label: ExternalLabelDefinition) => {
    const { items } = await sdk.labels.list({
      filter: {
        externalIdPrefix: label.externalId,
      },
    });
    if (
      !items ||
      (items &&
        !items.find(curLabel => curLabel.externalId === label.externalId))
    ) {
      await sdk.labels.create([label]);
    }
  };

  const onSuccess = () => {
    const invalidate = () => {
      client.invalidateQueries([
        'sdk-react-query-hooks',
        'cdf',
        'events',
        'list',
      ]);

      client.invalidateQueries([
        'sdk-react-query-hooks',
        'cdf',
        'labels',
        'list',
      ]);

      client.invalidateQueries([
        'sdk-react-query-hooks',
        'cdf',
        'files',
        'list',
      ]);

      client.invalidateQueries([
        'sdk-react-query-hooks',
        'cdf',
        'files',
        'get',
        'byIds',
      ]);
    };
    sleep(500).then(invalidate);
    sleep(1500).then(invalidate);
    sleep(5000).then(invalidate);
  };

  const onError = (error: any) => {
    notification.error({
      message: 'An error occurred while trying to approve this file.',
      description: JSON.stringify(error),
    });
  };

  const approveFile = async () => {
    await doesLabelExist(INTERACTIVE_LABEL);
    if (fileId) {
      const updatePatch: FileChangeUpdate[] = [
        {
          id: fileId,
          update: {
            labels: {
              add: [{ externalId: INTERACTIVE_LABEL.externalId }],
              remove:
                file && isFilePending(file)
                  ? [{ externalId: PENDING_LABEL.externalId }]
                  : undefined,
            },
          },
        },
      ];
      await sdk.files.update(updatePatch);
      notification.success({
        message: 'Diagram approved successfully',
      });
    }
  };

  const { isLoading, mutate: onApproveFile } = useMutation(approveFile, {
    onError,
    onSuccess,
  });

  return { isLoading, onApproveFile };
};

export const PENDING_LABEL = {
  externalId: 'Pending interactive engineering diagram',
  name: 'Pending interactive engineering diagram',
  description:
    'Diagrams that have this label have been contextualized but the detected tags have not been approved yet.',
};

export const INTERACTIVE_LABEL = {
  externalId: 'Interactive engineering diagram',
  name: 'Interactive engineering diagram',
  description:
    'Diagrams that have this label have been contextualized and the detected tags have been approved.',
};
