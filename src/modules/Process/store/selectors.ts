import isEqual from 'lodash-es/isEqual';
import { FileInfo } from '@cognite/sdk';
import {
  createSelector,
  createSelectorCreator,
  defaultMemoize,
} from 'reselect';

import { VisionAPIType } from 'src/api/types';
import { selectAllSelectedIds } from 'src/modules/Common/store/files/selectors';
import { AnnotationsBadgeStatuses } from 'src/modules/Common/types';
import { GenericSort, SortKeys } from 'src/modules/Common/Utils/SortUtils';
import { RootState } from 'src/store/rootReducer';
import { createFileInfo } from 'src/store/util/StateUtils';
import {
  annotatedFilesById,
  annotationsById,
} from 'src/modules/Common/store/annotation/selectors';
import {
  AnnotationStatus,
  getAnnotationsBadgeCounts,
} from 'src/utils/AnnotationUtils';
import { ProcessState, JobState } from './types';

export const selectAllFilesDict = (
  state: ProcessState
): { [id: number]: { jobIds: number[] } } => state.files.byId;

export const selectAllJobs = (
  state: ProcessState
): { [id: number]: JobState } => state.jobs.byId;

export const selectJobIdsByFileId = (
  state: ProcessState,
  fileId: number
): number[] => state.files.byId[fileId]?.jobIds || [];

export const selectJobsByFileId = createSelector(
  selectJobIdsByFileId,
  selectAllJobs,
  (fileJobIds, allJobs) => {
    return fileJobIds.map((jid) => allJobs[jid]);
  }
);

export const selectAllJobsForAllFilesDict = createSelector(
  selectAllFilesDict,
  selectAllJobs,
  (allFilesDict, allJobs) => {
    const allJobsAllFilesDict = Object.entries(allFilesDict).map(
      ([fileId, { jobIds }]) => {
        return { fileId, jobs: jobIds.map((jobId) => allJobs[jobId]) };
      }
    );
    return allJobsAllFilesDict;
  }
);

export const selectAllProcessFiles = createSelector(
  (state: RootState) => state.fileReducer.files.byId,
  (state: RootState) => state.processSlice.fileIds,
  (allFiles, allIds) => {
    const files: FileInfo[] = [];
    allIds.forEach(
      (id) => !!allFiles[id] && files.push(createFileInfo(allFiles[id]))
    );
    return files;
  }
);

export const selectIsPollingComplete = createSelector(
  selectAllFilesDict,
  selectAllJobs,
  (allFiles, allJobs) => {
    return Object.keys(allFiles).every((fileId) => {
      const fileJobs = allFiles[parseInt(fileId, 10)].jobIds;
      if (!fileJobs || !fileJobs.length) {
        return true;
      }
      return fileJobs.every((jobId) => {
        const job = allJobs[jobId];
        return job.status === 'Completed' || job.status === 'Failed';
      });
    });
  }
);

export const selectIsProcessingStarted = createSelector(
  (state: ProcessState) => state.files.byId,
  (allFiles) => {
    if (Object.keys(allFiles).length) {
      return Object.keys(allFiles).every((fileId) => {
        const fileJobs = allFiles[parseInt(fileId, 10)].jobIds;
        return fileJobs && fileJobs.length;
      });
    }
    return false;
  }
);

export const selectUnfinishedJobs = createSelector(
  (state: ProcessState) => state.jobs.allIds,
  selectAllJobs,
  (allJobIds, allJobs) => {
    return allJobIds
      .map((id) => allJobs[id])
      .filter(
        (job) =>
          job.jobId > 0 && (job.status === 'Queued' || job.status === 'Running')
      );
  }
);

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

export const makeSelectJobStatusForFile = () =>
  createDeepEqualSelector(
    (state: ProcessState, fileId: number) => fileId,
    selectJobsByFileId,
    (fileId, fileJobs) => {
      const annotationBadgeProps = {
        tag: {},
        gdpr: {},
        text: {},
        objects: {},
      };
      fileJobs.forEach((job) => {
        let status = 'Running';
        if (job.status === 'Queued') {
          status = 'Queued';
        } else if (job.completedFileIds?.includes(fileId)) {
          status = 'Completed';
        } else if (job.failedFileIds?.includes(fileId)) {
          status = 'Failed';
        }

        const statusData = {
          status,
          statusTime: job.statusTime,
          error: job.failedFiles?.find((file) => file.fileId === fileId)?.error,
        };
        if (job.type === VisionAPIType.OCR) {
          annotationBadgeProps.text = statusData;
        }
        if (job.type === VisionAPIType.TagDetection) {
          annotationBadgeProps.tag = statusData;
        }
        if (
          [VisionAPIType.ObjectDetection, VisionAPIType.CustomModel].includes(
            job.type
          )
        ) {
          annotationBadgeProps.objects = statusData;
          annotationBadgeProps.gdpr = statusData;
        }
      });
      return annotationBadgeProps as AnnotationsBadgeStatuses;
    }
  );

export const selectPageCount = createSelector(
  (state: ProcessState) => state.fileIds,
  (state: ProcessState) => state.sortMeta,
  (fileIds, sortMeta) => {
    return Math.ceil(fileIds.length / sortMeta.pageSize);
  }
);

export const selectProcessSortedFiles = createSelector(
  selectAllProcessFiles,
  (rootState: RootState) => rootState.processSlice.sortMeta.sortKey,
  (rootState: RootState) => rootState.processSlice.sortMeta.reverse,
  GenericSort
);

export const selectProcessSelectedFileIdsInSortedOrder = createSelector(
  selectProcessSortedFiles,
  (rootState: RootState) => selectAllSelectedIds(rootState.fileReducer),
  (sortedFiles, selectedIds) => {
    const indexMap = new Map<number, number>(
      sortedFiles.map((item, index) => [item.id, index])
    );

    const sortedIds = GenericSort(
      selectedIds,
      SortKeys.indexInSortedArray,
      false,
      indexMap
    );

    return sortedIds;
  }
);

export const selectProcessAllSelectedFilesInSortedOrder = createSelector(
  selectProcessSelectedFileIdsInSortedOrder,
  (rootState: RootState) => rootState.fileReducer.files.byId,
  (sortedSelectedFileIds, allFiles) => {
    return sortedSelectedFileIds.map((id) => allFiles[id]);
  }
);

export const selectProcessSummary = createSelector(
  selectAllProcessFiles,
  (state: RootState) => annotatedFilesById(state.annotationReducer),
  (state: RootState) => annotationsById(state.annotationReducer),
  (processFiles, allAnnotatedFiles, allAnnotations) => {
    // all files with geolocation
    const totalFilesWithGeolocation = processFiles.filter(
      (file) => !!file?.geoLocation
    );

    // get annotations of all processed files
    const annotationsForFile = processFiles.map((file) => ({
      file,
      annotations:
        allAnnotatedFiles[file.id]?.map(
          (annotationId) => allAnnotations[annotationId]
        ) || [],
    }));

    // get user reviewed files - select files where at least one annotation is not unhandled
    const totalUserReviewedFiles = annotationsForFile.filter(
      ({ annotations }) =>
        !!annotations.some(
          (annotation) => annotation.status !== AnnotationStatus.Unhandled
        )
    );

    // files with unresolved person detections
    const totalFilesWithUnresolvedGDPR = annotationsForFile.filter(
      ({ annotations }) =>
        !!annotations.filter(
          (annotation) =>
            annotation.modelType === VisionAPIType.ObjectDetection &&
            annotation.label === 'person' &&
            annotation.status === AnnotationStatus.Unhandled
        ).length
    );

    const annotationCountsForFile = annotationsForFile.map(
      ({ file, annotations }) => ({
        file,
        annotationCounts: getAnnotationsBadgeCounts(annotations),
      })
    );

    // files with tag, text or object - select files where annotation count for tag, text or object is > 0
    const totalFilesWithTagsTextOrObject = annotationCountsForFile.filter(
      ({ annotationCounts }) =>
        annotationCounts.text > 0 ||
        annotationCounts.assets > 0 ||
        annotationCounts.objects > 0 ||
        annotationCounts.gdpr > 0
    );

    const totalFileCountsByAnnotationTypes = annotationCountsForFile.reduce(
      (acc, next) => {
        if (next.annotationCounts) {
          return {
            text: next.annotationCounts.text > 0 ? acc.text + 1 : acc.text,
            assets:
              next.annotationCounts.assets > 0 ? acc.assets + 1 : acc.assets,
            objects:
              next.annotationCounts.gdpr > 0 ||
              next.annotationCounts.objects > 0
                ? acc.objects + 1
                : acc.objects,
          };
        }
        return acc;
      },
      {
        assets: 0,
        text: 0,
        objects: 0,
      }
    );

    const totalPercentagesByAnnotationTypes = {
      assets:
        Math.round(
          (totalFileCountsByAnnotationTypes.assets / processFiles.length) * 100
        ) || 0,
      text:
        Math.round(
          (totalFileCountsByAnnotationTypes.text / processFiles.length) * 100
        ) || 0,
      objects:
        Math.round(
          (totalFileCountsByAnnotationTypes.objects / processFiles.length) * 100
        ) || 0,
    };

    return {
      totalProcessed: processFiles.length,
      totalGeolocated: totalFilesWithGeolocation.length,
      totalUserReviewedFiles: totalUserReviewedFiles.length,
      totalModelDetected: totalFilesWithTagsTextOrObject.length,
      totalUnresolvedGDPR: totalFilesWithUnresolvedGDPR.length,
      fileCountsByAnnotationType: totalFileCountsByAnnotationTypes,
      filePercentagesByAnnotationType: totalPercentagesByAnnotationTypes,
    };
  }
);
