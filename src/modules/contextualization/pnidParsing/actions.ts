import { createAsyncThunk } from '@reduxjs/toolkit';
import { FileInfo } from '@cognite/sdk';
import { createPendingAnnotationsFromJob } from 'utils/AnnotationUtils';
import sdk from 'sdk-singleton';
import { callUntilCompleted } from 'helpers';
import {
  createAnnotations,
  listAnnotationsForFile,
} from '@cognite/annotations';
import {
  FileAnnotationsCount,
  PnidResponseEntity,
  RetrieveResultsResponseItem,
  RetrieveResultsResponseItems,
  StartPnidParsingJobProps,
} from './types';
import {
  verticesToBoundingBox,
  mapAssetsToEntities,
  mapDiagramsToEntities,
} from './helpers';
import handleError from '../../../utils/handleError';
import { createJob, finishJob, rejectJob, updateJob } from '.';

const pnidApiRootPath = (project: string) =>
  `/api/playground/projects/${project}/context/diagram`;
const createPnidDetectJobPath = (project: string) =>
  `${pnidApiRootPath(project)}/detect`;
const getPnidDetectJobPath = (project: string, jobId: number) =>
  `${pnidApiRootPath(project)}/detect/${jobId}`;

const createPendingAnnotations = async (
  file: FileInfo,
  jobId: string,
  annotations: RetrieveResultsResponseItem['annotations']
): Promise<FileAnnotationsCount> => {
  const existingAnnotations = await listAnnotationsForFile(sdk, file, false);

  const preparedAnnotations: PnidResponseEntity[] = annotations.map(
    (annotation) => ({
      text: annotation.text,
      boundingBox: verticesToBoundingBox(annotation.region.vertices),
      page: annotation.region.page,
      items: annotation.entities.map((item) => ({
        id: item.id,
        resourceType: item.resourceType,
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

  await createAnnotations(sdk, pendingAnnotations);

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

export const startPnidParsingJob = {
  action: createAsyncThunk(
    'workflow/startPnidParsingJob',
    async (
      { files, resources, options, workflowId }: StartPnidParsingJobProps,
      { getState, dispatch }: { getState: any; dispatch: any }
    ) => {
      const state = getState();

      const parsingJob = state.contextualization.pnidParsing
        ? state.contextualization.pnidParsing[workflowId]
        : {};

      // Job already ongoing
      if (parsingJob?.jobId) {
        return parsingJob?.jobId;
      }

      try {
        const response = await sdk.post(createPnidDetectJobPath(sdk.project), {
          data: {
            items: files.map((file) => ({ fileId: file.id })),
            entities: [
              ...mapAssetsToEntities(resources.assets),
              ...mapDiagramsToEntities(resources.diagrams),
            ],
            ...options,
          },
        });

        const {
          status: httpStatus,
          data: { jobId, status },
        } = response;

        // Mark job as started
        dispatch(createJob({ workflowId, initialValue: { jobId, status } }));

        // poll for results
        if (httpStatus === 200) {
          return await new Promise((resolve, reject) => {
            callUntilCompleted(
              () => sdk.get(getPnidDetectJobPath(sdk.project, jobId)),
              (data) => data.status === 'Completed' || data.status === 'Failed',
              async (data: {
                status: string;
                items: RetrieveResultsResponseItems;
              }) => {
                if (data.status === 'Failed') {
                  dispatch(rejectJob({ workflowId }));
                  reject();
                } else {
                  // Completed
                  const { items } = data;
                  const annotationCounts: {
                    [fileId: number]: FileAnnotationsCount;
                  } = {};
                  // Create new annotations & load old ones
                  await Promise.allSettled(
                    items.map(async ({ fileId, annotations }) => {
                      const file = files.find((f) => f.id === fileId);
                      if (file) {
                        const fileAnnotationCount = await createPendingAnnotations(
                          file,
                          jobId,
                          annotations
                        );
                        annotationCounts[fileId] = fileAnnotationCount;
                      }
                    })
                  );

                  dispatch(
                    finishJob({
                      workflowId,
                      annotationCounts,
                    })
                  );

                  resolve(jobId);
                }
              },
              (data: { status: string }) => {
                dispatch(
                  updateJob({
                    workflowId,
                    status: data.status,
                  })
                );
              },
              undefined,
              3000
            );
          });
        }
        return jobId;
      } catch (e) {
        handleError({ ...e });
        dispatch(rejectJob({ workflowId }));
        return e;
      }
    }
  ),
};
