import { createAsyncThunk } from '@reduxjs/toolkit';
import { FileInfo } from '@cognite/sdk';
import { createPendingAnnotationsFromJob } from 'utils/AnnotationUtils';
import sdk from 'sdk-singleton';
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
  PollJobResultsProps,
  PnidsParsingJobSchema,
} from 'modules/types';
import { setJobId, workflowDiagramsSelector } from 'modules/workflows';
import handleError from 'utils/handleError';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';
import {
  verticesToBoundingBox,
  mapAssetsToEntities,
  mapFilesToEntities,
} from './helpers';
import { createJob, finishJob, rejectJob, resetJob, updateJob } from '.';

const pnidApiRootPath = (project: string) =>
  `/api/playground/projects/${project}/context/diagram`;
const createPnidDetectJobPath = (project: string) =>
  `${pnidApiRootPath(project)}/detect`;
const getPnidDetectJobPath = (project: string, jobId: number) =>
  `${pnidApiRootPath(project)}/detect/${jobId}`;

const createPendingAnnotations = async (
  file: FileInfo,
  jobId: string,
  annotations: NonNullable<RetrieveResultsResponseItem['annotations']>
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
      { diagrams, resources, options, workflowId }: StartPnidParsingJobProps,
      { getState, dispatch }: { getState: () => any; dispatch: any }
    ) => {
      const state = getState();

      const workflow = state.workflows.items[workflowId];

      const parsingJob = state.contextualization.pnidParsing
        ? state.contextualization.pnidParsing[workflowId]
        : {};

      // Same Job already ongoing
      if (workflow?.jobId && parsingJob?.jobId === workflow?.jobId) {
        return workflow?.jobId;
      }

      if (!workflow?.jobId && parsingJob?.jobId) {
        // Remove old job results from state
        dispatch(resetJob({ workflowId }));
      }

      if (workflow?.jobId && !parsingJob) {
        // Job has already been created, so don't call detect again but instead update redux + poll results
        dispatch(
          createJob({
            workflowId,
            initialValue: { jobId: workflow?.jobId, status: 'UNKNOWN' },
          })
        );
        dispatch(
          pollJobResults.action({
            jobId: workflow?.jobId,
            workflowId,
          })
        );
        return workflow?.jobId;
      }
      // Job not created yet, so need to create it
      try {
        const mappedDiagrams = diagrams.map((diagram: FileInfo) => ({
          fileId: diagram.id,
        }));

        const mappedResources = [
          ...mapAssetsToEntities(resources.assets),
          ...mapFilesToEntities(resources.files),
        ];

        const response = await sdk.post(createPnidDetectJobPath(sdk.project), {
          data: {
            items: mappedDiagrams,
            entities: mappedResources,
            ...options,
          },
        });

        const {
          status: httpStatus,
          data: { jobId, status },
        } = response;

        trackUsage(PNID_METRICS.parsingJob.start, {
          jobId,
        });

        // Mark job as started
        dispatch(createJob({ workflowId, initialValue: { jobId, status } }));
        // Set jobId in workflow
        dispatch(setJobId({ workflowId, jobId }));

        // poll for results
        if (httpStatus === 200) {
          dispatch(pollJobResults.action({ jobId, workflowId }));
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

export const pollJobResults = {
  action: createAsyncThunk(
    'workflow/pollJobResults',
    async (
      { jobId, workflowId }: PollJobResultsProps,
      { getState, dispatch }: { getState: () => any; dispatch: any }
    ) => {
      const state = getState();
      const { data } = await sdk.get(getPnidDetectJobPath(sdk.project, jobId));
      const { status, items = [], statusCount } = data;
      const getDiagrams = workflowDiagramsSelector(workflowId, true);

      const diagrams = getDiagrams(state);

      if (status === 'Completed' || status === 'Failed') {
        trackUsage(PNID_METRICS.parsingJob.end, {
          jobId,
          status,
        });

        if (status === 'Completed') {
          trackUsage(PNID_METRICS.parsingJob.results, {
            failed: statusCount?.failed ?? 0,
            completed: statusCount?.completed ?? 0,
          });
          const { annotationCounts, failedFiles } = await handleNewAnnotations(
            diagrams,
            items,
            jobId
          );
          dispatch(
            finishJob({
              workflowId,
              statusCount,
              annotationCounts,
              failedFiles,
            })
          );
        } else {
          dispatch(rejectJob({ workflowId }));
        }
      } else {
        dispatch(
          updateJob({
            workflowId,
            status,
            statusCount,
          })
        );
      }
    }
  ),
};

const handleNewAnnotations = async (
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
          failedFiles.push({ fileId, errorMessage });
        }
      }
    )
  );
  return { annotationCounts, failedFiles };
};
