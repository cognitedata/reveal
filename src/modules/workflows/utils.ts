import { FileChangeUpdate, Asset, FileInfo } from '@cognite/sdk';
import {
  createAnnotations,
  listAnnotationsForFile,
} from '@cognite/annotations';
import sdk from '@cognite/cdf-sdk-singleton';
import {
  workflowDiagramStatusSelector,
  workflowAllResourcesStatusSelector,
} from 'modules/workflows';
import {
  PnidsParsingJobSchema,
  FileAnnotationsCount,
  PnidResponseEntity,
  RetrieveResultsResponseItem,
  RetrieveResultsResponseItems,
  PnidFailedFileSchema,
  Workflow,
  Vertices,
  BoundingBox,
} from 'modules/types';
import { createPendingAnnotationsFromJob } from 'utils/AnnotationUtils';
import { getUniqueValuesArray } from 'utils/utils';
import { translateError } from 'utils/handleError';
import {
  isFileApproved,
  isFilePending,
  doesLabelExist,
  PENDING_LABEL,
  INTERACTIVE_LABEL,
} from 'hooks';
import { RootState } from 'store';
import { loadWorkflowDiagrams, loadWorkflowResources } from './actions';
import { MatchFields } from './types';

export const updateSingleJobStatus = (
  workflowJobs: Workflow['jobs'],
  jobId: number,
  fieldsToUpdate: Record<string, any>
): Workflow['jobs'] => {
  const fixedWorkflowJobs = workflowJobs;
  const jobIndex = fixedWorkflowJobs.list.findIndex(
    (job) => job.jobId === jobId
  );
  if (jobIndex !== -1) {
    fixedWorkflowJobs.list[jobIndex] = {
      ...workflowJobs.list[jobIndex],
      ...fieldsToUpdate,
    };
  } else
    fixedWorkflowJobs.list.push({
      jobId,
      ...fieldsToUpdate,
    });
  return fixedWorkflowJobs as Workflow['jobs'];
};

export const handleNewAnnotations = async (
  diagrams: FileInfo[],
  items: RetrieveResultsResponseItems,
  jobId: number
) => {
  const annotationCounts: {
    [fileId: number]: FileAnnotationsCount;
  } = {};
  const failedFiles: PnidsParsingJobSchema['failedFiles'] = [];

  await Promise.allSettled(
    (items as RetrieveResultsResponseItems).map(
      async ({ fileId, annotations, errorMessage }) => {
        if (annotations) {
          const diagram = diagrams.find((d) => d.id === fileId);
          if (diagram) {
            const fileAnnotationCount = await createPendingAnnotations(
              diagram,
              String(jobId),
              annotations
            );
            annotationCounts[fileId] = fileAnnotationCount;
          }
        } else if (errorMessage) {
          const err = translateError(errorMessage);
          const failedFile: PnidFailedFileSchema = { fileId };
          if (err) failedFile.errorMessage = err;
          failedFiles.push(failedFile);
        }
      }
    )
  );
  return { annotationCounts, failedFiles };
};

export const createPendingAnnotations = async (
  file: FileInfo,
  jobId: string,
  annotations: NonNullable<RetrieveResultsResponseItem['annotations']>
): Promise<FileAnnotationsCount> => {
  const existingAnnotations = await listAnnotationsForFile(sdk, file, true);

  const existingNotRejectedAnnotations = existingAnnotations.filter(
    (annotation) => annotation.status !== 'deleted'
  );
  const existingUnhandledAnnotations = existingAnnotations.filter(
    (annotation) => annotation.status === 'unhandled'
  );
  const preparedAnnotations: PnidResponseEntity[] = annotations.map(
    (annotation) => ({
      text: annotation.text,
      boundingBox: verticesToBoundingBox(annotation.region.vertices),
      page: annotation.region.page,
      items: getUniqueValuesArray(annotation.entities).map((item) => ({
        resourceType: item.resourceType,
        id: item.id,
        externalId: item?.externalId,
      })),
    })
  );

  // generate valid annotations
  const pendingAnnotations = await createPendingAnnotationsFromJob(
    file,
    preparedAnnotations,
    `${jobId!}`,
    existingAnnotations
  );

  const hasLinkedPendingTags = pendingAnnotations.some(
    (an) =>
      (an.resourceId || an.resourceExternalId) && an.status === 'unhandled'
  );

  await createAnnotations(sdk, pendingAnnotations);

  const isFileMissingLabel =
    !isFilePending(file) && !!existingUnhandledAnnotations.length;

  // If file is missing the pending label OR has unapproved annotations
  if (hasLinkedPendingTags || isFileMissingLabel) {
    await setFilePending(file);
  }
  if (!existingNotRejectedAnnotations?.length && !hasLinkedPendingTags) {
    await setFileNoLabels(file);
  }

  return {
    existingFilesAnnotations: existingAnnotations.filter(
      (anotation) => anotation.resourceType === 'file'
    ).length,
    existingAssetsAnnotations: existingAnnotations.filter(
      (anotation) => anotation.resourceType === 'asset'
    ).length,
    newFilesAnnotations: pendingAnnotations.filter(
      (annotation) => annotation.resourceType === 'file'
    ).length,
    newAssetAnnotations: pendingAnnotations.filter(
      (annotation) => annotation.resourceType === 'asset'
    ).length,
  };
};

export const setFilePending = async (file: FileInfo) => {
  await doesLabelExist(PENDING_LABEL);

  const updatePatch: FileChangeUpdate['update'] = {
    labels: {
      add: [{ externalId: PENDING_LABEL.externalId }],
    },
  };
  if (file && isFileApproved(file)) {
    updatePatch.labels = {
      ...updatePatch.labels,
      remove: [{ externalId: INTERACTIVE_LABEL.externalId }],
    };
  }
  await sdk.files.update([
    {
      id: file.id,
      update: updatePatch,
    },
  ]);
};

export const setFileNoLabels = async (file: FileInfo) => {
  const updatePatch: FileChangeUpdate['update'] = {
    labels: {
      remove: [
        { externalId: INTERACTIVE_LABEL.externalId },
        { externalId: PENDING_LABEL.externalId },
      ],
    },
  };
  await sdk.files.update([
    {
      id: file.id,
      update: updatePatch,
    },
  ]);
};

/**
 * Asynchronically loads workflow's resources if they weren't previously loaded.
 * @param workflowId
 * @returns
 */
export const loadWorkflowAsync = (workflowId: number) => {
  return async (dispatch: any, getState: () => RootState) => {
    const loadDiagrams = async () => {
      const diagramsStatus = workflowDiagramStatusSelector(
        workflowId,
        true
      )(getState());
      if (!diagramsStatus.done && !diagramsStatus.loading) {
        await dispatch(loadWorkflowDiagrams({ workflowId, loadAll: true }));
      }
      return Promise.resolve();
    };
    const loadResources = async () => {
      const resourcesStatus = workflowAllResourcesStatusSelector(
        workflowId,
        true
      )(getState());
      if (!resourcesStatus.done && !resourcesStatus.loading) {
        await dispatch(loadWorkflowResources({ workflowId, loadAll: true }));
      }
      return Promise.resolve();
    };
    await loadDiagrams();
    await loadResources();
    return Promise.resolve();
  };
};

export const verticesToBoundingBox = (vertices: Vertices): BoundingBox => {
  let xMin = 0;
  let yMin = 0;
  let yMax = 0;
  let xMax = 0;
  // if it is a rectangle
  if (vertices.length === 4) {
    xMin = vertices[0].x;
    yMin = vertices[0].y;
    xMax = vertices[2].x;
    yMax = vertices[2].y;
  }
  return { xMin, yMin, xMax, yMax };
};

export const boundingBoxToVertices = (boundingBox: BoundingBox): Vertices => {
  const { xMin, xMax, yMin, yMax } = boundingBox;
  const vertices: Vertices = [
    { x: xMin, y: yMin },
    { x: xMax, y: yMin },
    { x: xMax, y: yMax },
    { x: xMin, y: yMax },
  ];
  return vertices;
};

export const mapAssetsToEntities = (
  assets?: Asset[],
  fieldToMatch: MatchFields['assets'] = 'name',
  userDefinedField: string = 'userDefinedField'
) => {
  const isMetadata = fieldToMatch.includes('metadata');
  const metadataField: keyof Asset['metadata'] = (
    isMetadata ? fieldToMatch.replace('metadata.', '') : fieldToMatch
  ) as keyof Asset['metadata'];

  return (assets ?? []).map((asset) => ({
    resourceType: 'asset',
    id: asset.id,
    externalId: asset.externalId,
    [userDefinedField]: isMetadata
      ? (asset?.metadata ?? {})[metadataField] ?? ''
      : asset[fieldToMatch as keyof Asset] ?? '',
  }));
};

export const mapFilesToEntities = (
  files?: FileInfo[],
  fieldToMatch: MatchFields['files'] = 'name',
  userDefinedField: string = 'userDefinedField'
) => {
  const isMetadata = fieldToMatch.includes('metadata');
  const metadataField: keyof FileInfo['metadata'] = (
    isMetadata ? fieldToMatch.replace('metadata.', '') : fieldToMatch
  ) as keyof FileInfo['metadata'];

  return (files ?? []).map((file) => ({
    resourceType: 'file',
    id: file.id,
    externalId: file.externalId,
    [userDefinedField]: isMetadata
      ? (file?.metadata ?? {})[metadataField] ?? ''
      : file[fieldToMatch as keyof FileInfo] ?? '',
  }));
};
