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
import { notification } from 'antd';
import handleError from '../utils/handleError';
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

export const isFileApproved = (file: FileInfo) => {
  return file.labels?.find(
    (label) => label.externalId === INTERACTIVE_LABEL.externalId
  );
};

export const isFilePending = (file: FileInfo) => {
  return file.labels?.find(
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
  const annotationsMap = useAnnotationsForFiles(fileIds);

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
            add: [{ externalId: INTERACTIVE_LABEL.externalId }],
            remove:
              file && isFileApproved(file)
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

  const { mutate: onApproved } = useMutation(
    (selectedFileIds: Array<number>) => setFilesApproved(selectedFileIds),
    {
      onError,
      onSuccess,
    }
  );

  const { mutate: onPending } = useMutation(
    (selectedFileIds: Array<number>) => setFilesPending(selectedFileIds),
    {
      onError,
      onSuccess,
    }
  );

  const { mutate: onRejected } = useMutation(
    (selectedFileIds: Array<number>) => setFilesRejected(selectedFileIds),
    {
      onError,
      onSuccess,
    }
  );

  return { onApproved, onPending, onRejected };
};

export const REVIEW_DIAGRAMS_LABELS = {
  approve: {
    all: {
      button: 'Approve all tags',
      desc: 'Are you sure you want to approve all new links? Changes will be saved to CDF and everybody will have access to them.',
    },
    some: {
      button: 'Approve tags',
      desc: 'Are you sure you want to approve selected links? Changes will be saved to CDF and everybody will have access to them.',
    },
  },
  reject: {
    all: {
      button: 'Reject all tags',
      desc: 'Are you sure you want to reject all new links? You will be able to recontextualize later.',
    },
    some: {
      button: 'Reject tags',
      desc: 'Are you sure you want to reject selected links? You will be able to recontextualize later.',
    },
  },
};
