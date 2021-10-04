import { useCdfItem, useList } from '@cognite/sdk-react-query-hooks';
import {
  FileInfo,
  CogniteEvent,
  ExternalLabelDefinition,
  FileChangeUpdate,
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

  return convertEventsToAnnotations(
    uniqBy([...eventsById, ...eventsByExternalId], el => el.id)
  ).filter(annotation => annotation.status !== 'deleted');
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
