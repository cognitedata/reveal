import React from 'react';
import { Modal, notification } from 'antd';
import { Body } from '@cognite/cogs.js';
import { useCdfItems, useUserInfo } from '@cognite/sdk-react-query-hooks';
import {
  ExternalLabelDefinition,
  FileChangeUpdate,
  FileInfo,
} from '@cognite/sdk';
import sdk from 'sdk-singleton';
import { useMutation, useQueryClient } from 'react-query';
import { updateAnnotations } from '@cognite/annotations';
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
  if (!file) {
    return false;
  }
  return !!file.labels?.find(
    (label) => label.externalId === INTERACTIVE_LABEL.externalId
  );
};

export const isFilePending = (file: FileInfo) => {
  return !!file.labels?.find(
    (label) => label.externalId === PENDING_LABEL.externalId
  );
};

export const useReviewFiles = (fileIds: Array<number>) => {
  const client = useQueryClient();

  const { data: userData } = useUserInfo();
  const { email = 'UNKNOWN' } = userData || {};

  const { data: files } = useCdfItems<FileInfo>(
    'files',
    fileIds.map((id) => ({ id }))
  );
  const { annotations: annotationsMap } = useAnnotationsForFiles(fileIds);

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
        'byIds',
      ]);
    };
    sleep(500).then(invalidate);
    sleep(1500).then(invalidate);
    sleep(5000).then(invalidate);
  };

  const reviewAnnotations = async (fileId: number, approve?: boolean) => {
    const annotations = annotationsMap[fileId];
    const unhandledAnnotations = annotations.filter(
      (annotation) => annotation.status === 'unhandled'
    );
    if (unhandledAnnotations.length)
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
              set: email,
            },
          },
        }))
      );
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
    notification.success({
      message: 'Diagram approved successfully!',
    });
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
    notification.success({
      message: 'Diagram tags rejected successfully!',
    });
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

  const clearFileLabels = async (fileId: number) => {
    const file = files?.find((curFile) => curFile.id === fileId);
    if (file) {
      const labelsToRemove = [];
      if (isFileApproved(file)) {
        labelsToRemove.push({ externalId: INTERACTIVE_LABEL.externalId });
      }
      if (isFilePending(file)) {
        labelsToRemove.push({ externalId: PENDING_LABEL.externalId });
      }

      if (labelsToRemove.length) {
        await sdk.files.update([
          {
            id: fileId,
            update: {
              labels: {
                remove: labelsToRemove,
              },
            },
          },
        ]);
      }
    }
  };

  const { isLoading: isOnApprovedLoading, mutate: onApproved } = useMutation(
    (selectedFileIds: Array<number>) => setFilesApproved(selectedFileIds),
    {
      onError,
      onSuccess,
    }
  );
  const { isLoading: isOnPendingLoading, mutate: onPending } = useMutation(
    (selectedFileIds: Array<number>) => setFilesPending(selectedFileIds),
    {
      onError,
      onSuccess,
    }
  );
  const { isLoading: isOnRejectedLoading, mutate: onRejected } = useMutation(
    (selectedFileIds: Array<number>) => setFilesRejected(selectedFileIds),
    {
      onError,
      onSuccess,
    }
  );
  const { isLoading: isOnClearFileTags, mutate: onClearFileTags } = useMutation(
    (fileId: number) => clearFileLabels(fileId),
    {
      onError,
      onSuccess,
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

  return {
    onApproved,
    onPending,
    onRejected,
    onClearFileTags,
    isOnApprovedLoading,
    isOnPendingLoading,
    isOnRejectedLoading,
    isOnClearFileTags,
    onApproveDiagrams,
    onRejectDiagrams,
  };
};

export const REVIEW_DIAGRAMS_LABELS = {
  approve: {
    all: {
      button: 'Approve all pending tags',
      desc: 'Are you sure you want to approve all new links? Changes will be saved to CDF and everybody will have access to them.',
    },
    some: {
      button: 'Approve tags',
      desc: 'Are you sure you want to approve selected links? Changes will be saved to CDF and everybody will have access to them.',
    },
  },
  reject: {
    all: {
      button: 'Reject all pending tags',
      desc: 'Are you sure you want to reject all new links? You will be able to recontextualize later.',
    },
    some: {
      button: 'Reject tags',
      desc: 'Are you sure you want to reject selected links? You will be able to recontextualize later.',
    },
  },
};
