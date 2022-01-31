import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import chunk from 'lodash/chunk';
import uniqBy from 'lodash/uniqBy';
import { Modal, notification } from 'antd';

import { Body } from '@cognite/cogs.js';
import sdk from '@cognite/cdf-sdk-singleton';
import {
  useCdfItem,
  useCdfItems,
  useList,
} from '@cognite/sdk-react-query-hooks';
import {
  ExternalLabelDefinition,
  FileChangeUpdate,
  FileInfo,
  CogniteEvent,
} from '@cognite/sdk';
import {
  getIdFilter,
  getExternalIdFilter,
  updateAnnotations,
  linkFileToAssetIds,
} from '@cognite/annotations';
import { useUserId } from 'hooks/useUserId';

import { sleep } from 'utils/utils';
import handleError from 'utils/handleError';
import { useAnnotationsForFiles } from './useAnnotationsForFiles';

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

export const doesLabelExist = async (label: ExternalLabelDefinition) => {
  const { items } = await sdk.labels.list({
    filter: {
      externalIdPrefix: label.externalId,
    },
  });
  if (
    !items ||
    (items &&
      !items.find((curLabel) => curLabel.externalId === label.externalId))
  ) {
    await sdk.labels.create([label]);
  }
};

export const isFileApproved = (file?: FileInfo) => {
  if (!file) return false;
  return !!file.labels?.find(
    (label) => label.externalId === INTERACTIVE_LABEL.externalId
  );
};

export const isFilePending = (file?: FileInfo) => {
  if (!file) return false;
  return !!file.labels?.find(
    (label) => label.externalId === PENDING_LABEL.externalId
  );
};

export const useReviewFiles = (fileIds: Array<number>) => {
  const client = useQueryClient();

  const { mail } = useUserId();

  const { data: files } = useCdfItems<FileInfo>(
    'files',
    fileIds.map((id) => ({ id }))
  );
  const { annotations: annotationsMap } = useAnnotationsForFiles(fileIds);
  const { deleteAnnotationsForFile } = useDeleteTags();

  const onError = (error: any) => {
    handleError({ ...error });
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
        'byId',
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
  const onApproveSuccess = () => {
    notification.success({
      message: 'Diagram tags successfully approved',
    });
    onSuccess();
  };
  const onRejectSuccess = () => {
    notification.success({
      message: 'Diagram tags successfully rejected',
    });
    onSuccess();
  };
  const onClearSuccess = () => {
    notification.success({
      message: 'Diagram tags successfully deleted',
    });
    onSuccess();
  };

  const reviewAnnotations = async (fileId: number, approve?: boolean) => {
    const annotations = annotationsMap[fileId];
    const unhandledAnnotations = annotations.filter(
      (annotation) => annotation.status === 'unhandled'
    );
    if (unhandledAnnotations.length) {
      await updateAnnotations(
        sdk,
        unhandledAnnotations.map((annotation) => ({
          id: annotation.id,
          annotation,
          update: {
            status: {
              set: approve ? 'verified' : 'deleted',
            },
            checkedBy: {
              set: mail,
            },
          },
        }))
      );
      if (approve) {
        await linkFileToAssetIds(sdk, unhandledAnnotations);
      }
    }
  };

  const setFilesApproved = async (selectedFileIds: Array<number>) => {
    await Promise.allSettled(
      selectedFileIds.map((fileId) => reviewAnnotations(fileId, true))
    );
    await doesLabelExist(INTERACTIVE_LABEL);

    const updatePatch: FileChangeUpdate[] = selectedFileIds.map((fileId) => {
      const file = files?.find((curFile) => curFile.id === fileId);
      return {
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
      };
    });
    await sdk.files.update(updatePatch);
  };

  const isFileInteractive = (fileId: number) => {
    return annotationsMap[fileId]?.some((an) => an.status === 'verified');
  };

  const setFilesRejected = async (selectedFileIds: Array<number>) => {
    await Promise.allSettled(
      selectedFileIds.map((fileId) => reviewAnnotations(fileId, false))
    );
    await doesLabelExist(INTERACTIVE_LABEL);

    const updatePatch: FileChangeUpdate[] = selectedFileIds.map((fileId) => {
      const file = files?.find((curFile) => curFile.id === fileId);
      return {
        id: fileId,
        update: {
          labels: {
            add: isFileInteractive(fileId)
              ? [{ externalId: INTERACTIVE_LABEL.externalId }]
              : undefined,
            remove:
              file && isFilePending(file)
                ? [{ externalId: PENDING_LABEL.externalId }]
                : undefined,
          },
        },
      };
    });
    await sdk.files.update(updatePatch);
  };

  const setFilesPending = async (selectedFileIds: Array<number>) => {
    await doesLabelExist(PENDING_LABEL);

    const updatePatch: FileChangeUpdate[] = selectedFileIds.map((fileId) => {
      const file = files?.find((curFile) => curFile.id === fileId);
      return {
        id: fileId,
        update: {
          labels: {
            add: [{ externalId: PENDING_LABEL.externalId }],
            remove:
              file && isFileApproved(file)
                ? [{ externalId: INTERACTIVE_LABEL.externalId }]
                : undefined,
          },
        },
      };
    });
    await sdk.files.update(updatePatch);
  };

  const clearFileLabels = async (selectedFileIds: Array<number>) => {
    const updatePatch: FileChangeUpdate[] = selectedFileIds.map((fileId) => {
      const file = files?.find((curFile) => curFile.id === fileId);
      const labelsToRemove = [];
      if (isFileApproved(file)) {
        labelsToRemove.push({ externalId: INTERACTIVE_LABEL.externalId });
      }
      if (isFilePending(file)) {
        labelsToRemove.push({ externalId: PENDING_LABEL.externalId });
      }
      return {
        id: fileId,
        update: {
          labels: {
            remove: labelsToRemove,
          },
        },
      };
    });
    await sdk.files.update(updatePatch);
  };

  const {
    isLoading: isOnApprovedLoading,
    isSuccess: isOnApprovedSuccess,
    mutate: onApproved,
  } = useMutation(
    (selectedFileIds: Array<number>) => setFilesApproved(selectedFileIds),
    {
      onError,
      onSuccess: onApproveSuccess,
    }
  );
  const { isLoading: isOnPendingLoading, mutate: onPending } = useMutation(
    (selectedFileIds: Array<number>) => setFilesPending(selectedFileIds),
    {
      onError,
      onSuccess,
    }
  );
  const {
    isLoading: isOnRejectedLoading,
    isSuccess: isOnRejectedSuccess,
    mutate: onRejected,
  } = useMutation(
    (selectedFileIds: Array<number>) => setFilesRejected(selectedFileIds),
    {
      onError,
      onSuccess: onRejectSuccess,
    }
  );
  const { isLoading: isOnClearFileTags, mutate: onClearFileTags } = useMutation(
    (selectedFileIds: Array<number>) => clearFileLabels(selectedFileIds),
    {
      onError,
      onSuccess: onClearSuccess,
    }
  );

  const onApproveDiagrams = async (all?: boolean) => {
    const okText = all
      ? REVIEW_DIAGRAMS_LABELS.approve.all.button
      : REVIEW_DIAGRAMS_LABELS.approve.some.button;
    const content = all
      ? REVIEW_DIAGRAMS_LABELS.approve.all.desc
      : REVIEW_DIAGRAMS_LABELS.approve.some.desc;

    Modal.confirm({
      icon: <></>,
      width: 320,
      maskClosable: true,
      okText,
      cancelText: 'Cancel',
      cancelButtonProps: { type: 'text' },
      content: <Body level={2}>{content}</Body>,
      onOk: async () => onApproved(fileIds),
    });
  };

  const onRejectDiagrams = async (all?: boolean) => {
    const okText = all
      ? REVIEW_DIAGRAMS_LABELS.reject.all.button
      : REVIEW_DIAGRAMS_LABELS.reject.some.button;
    const content = all
      ? REVIEW_DIAGRAMS_LABELS.reject.all.desc
      : REVIEW_DIAGRAMS_LABELS.reject.some.desc;

    Modal.confirm({
      icon: <></>,
      width: 320,
      maskClosable: true,
      okText,
      cancelText: 'Cancel',
      cancelButtonProps: { type: 'text' },
      content: <Body level={2}>{content}</Body>,
      onOk: async () => onRejected(fileIds),
    });
  };

  const onClearTags = async (selectedFileIds: number[]) => {
    const okText = REVIEW_DIAGRAMS_LABELS.clear.some.button;
    const content = REVIEW_DIAGRAMS_LABELS.clear.some.desc;

    Modal.confirm({
      icon: <></>,
      width: 320,
      maskClosable: true,
      okText,
      cancelText: 'Cancel',
      cancelButtonProps: { type: 'text' },
      content: <Body level={2}>{content}</Body>,
      onOk: async () => {
        await Promise.all(
          selectedFileIds.map((fileId: number) =>
            deleteAnnotationsForFile(fileId)
          )
        );
        await onClearFileTags(selectedFileIds);
      },
    });
  };

  return {
    onApproved,
    onPending,
    onRejected,
    isOnApprovedLoading,
    isOnPendingLoading,
    isOnRejectedLoading,
    isOnApprovedSuccess,
    isOnRejectedSuccess,
    isOnClearFileTags,
    onApproveDiagrams,
    onRejectDiagrams,
    onClearTags,
  };
};

export const useDeleteTags = () => {
  const [fileId, setFileId] = useState<number>();
  const [shouldDelete, setShouldDelete] = useState<boolean>(false);
  const [fileIdFilter, setFileIdFilter] = useState<any>();
  const [fileExternalIdFilter, setFileExternalIdFilter] = useState<any>();

  const { data: file } = useCdfItem<FileInfo>(
    'files',
    // @ts-ignore
    { id: fileId! },
    { enabled: !!fileId }
  );
  const {
    data: eventsById,
    isError: isEventsByIdError,
    isFetched: isEventsByIdFetched,
  } = useList<CogniteEvent>(
    'events',
    { filter: fileIdFilter, limit: 1000 },
    { enabled: !!file && !!fileIdFilter }
  );
  const {
    data: eventsByExternalId,
    isError: isEventsByExternalIdError,
    isFetched: isEventsByExternalIdFetched,
  } = useList<CogniteEvent>(
    'events',
    { filter: fileExternalIdFilter, limit: 1000 },
    { enabled: !!file && !!fileExternalIdFilter }
  );

  useEffect(() => {
    if (file?.id) setFileIdFilter(getIdFilter(file.id));
    if (file?.externalId)
      setFileExternalIdFilter(
        file?.externalId ? getExternalIdFilter(file.externalId) : undefined
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  useEffect(() => {
    const deleteAll = async () => {
      const allAnnotations: CogniteEvent[] = uniqBy(
        [...(eventsById ?? []), ...(eventsByExternalId ?? [])],
        (el: CogniteEvent) => el.id
      );
      const chunkedList = chunk(allAnnotations, 1000);
      const deleteRequests = chunkedList.map((items) =>
        sdk.events.delete([...items.map((event) => ({ id: event.id }))])
      );
      await Promise.allSettled(deleteRequests);
      setShouldDelete(false);
    };
    if (
      shouldDelete &&
      (eventsById || eventsByExternalId) &&
      (isEventsByIdFetched || isEventsByExternalIdFetched)
    )
      deleteAll();
  }, [
    shouldDelete,
    eventsById,
    eventsByExternalId,
    isEventsByIdFetched,
    isEventsByExternalIdFetched,
  ]);

  useEffect(() => {
    if (isEventsByIdError || isEventsByExternalIdError) {
      // [todo] put legit error here
      // console.log('error :(');
    }
  }, [isEventsByIdError, isEventsByExternalIdError]);

  const deleteAnnotationsForFile = (newFileId: number) => {
    setFileId(newFileId);
    setShouldDelete(true);
  };

  return { deleteAnnotationsForFile };
};

export const REVIEW_DIAGRAMS_LABELS = {
  approve: {
    all: {
      button: 'Approve all tags',
      desc: 'Accept all tags?',
    },
    some: {
      button: 'Approve tags',
      desc: 'Approve selected tags?',
    },
  },
  reject: {
    all: {
      button: 'Reject all tags',
      desc: (
        <>
          <Body level={2} strong>
            Reject all tags?
          </Body>
          <Body level={2}>The tags will be removed from the diagram.</Body>
        </>
      ),
    },
    some: {
      button: 'Reject tags',
      desc: (
        <>
          <Body level={2} strong>
            Reject selected tags?
          </Body>
          <Body level={2}>The tags will be removed from the diagram.</Body>
        </>
      ),
    },
  },
  clear: {
    all: {
      button: 'Clear all tags',
      desc: (
        <>
          <Body level={2} strong>
            Clear all tags?
          </Body>
          <Body level={2}>All tags from the diagrams will be removed.</Body>
        </>
      ),
    },
    some: {
      button: 'Clear tags',
      desc: (
        <>
          <Body level={2} strong>
            Clear all tags?
          </Body>
          <Body level={2}>All tags from the diagram will be removed.</Body>
        </>
      ),
    },
  },
};
