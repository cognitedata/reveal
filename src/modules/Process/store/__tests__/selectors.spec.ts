import { AnnotationStatus, VisionAnnotation } from 'src/utils/AnnotationUtils';
import { selectProcessSummary } from 'src/modules/Process/store/selectors';
import { initialState as annotationReducerInitialState } from 'src/modules/Common/store/annotation/slice';
import { initialState as fileReducerInitialState } from 'src/modules/Common/store/files/slice';
import { initialState as processSliceInitialState } from 'src/modules/Process/store/slice';
import { RootState } from 'src/store/rootReducer';
import { AnnotationState } from 'src/modules/Common/store/annotation/types';
import { FileState } from 'src/modules/Common/store/files/types';
import { ProcessState } from 'src/modules/Process/store/types';
import { mockFileList } from 'src/__test-utils/fixtures/files';
import { VisionFilesToFileState } from 'src/store/util/StateUtils';
import { VisionAPIType } from 'src/api/types';
import { getDummyAnnotation } from 'src/__test-utils/annotations';

const getRootState = (
  fileIds: number[],
  annotationsByFile: { [key: string]: number[] },
  annotationsById: { [key: string]: VisionAnnotation }
) => {
  const annotationState: AnnotationState = {
    ...annotationReducerInitialState,
    files: {
      byId: annotationsByFile,
    },
    annotations: {
      byId: annotationsById,
    },
  };

  const fileState: FileState = {
    ...fileReducerInitialState,
    files: {
      byId: VisionFilesToFileState(
        mockFileList.filter((file) => fileIds.includes(file.id))
      ),
      allIds: fileIds,
      selectedIds: [],
    },
  };

  const processState: ProcessState = {
    ...processSliceInitialState,
    fileIds,
  };
  return {
    processSlice: processState,
    annotationReducer: annotationState,
    fileReducer: fileState,
  } as RootState;
};

describe('Test selectProcessSummary', () => {
  it('should return summary correctly when some files are available', () => {
    const fileIds = [1, 2, 3, 4];
    const rootState = getRootState(
      fileIds,
      {
        1: [1, 2],
        2: [3, 4],
        3: [5, 6, 7],
      },
      {
        '1': getDummyAnnotation(1),
        '2': getDummyAnnotation(2, VisionAPIType.OCR, {
          status: AnnotationStatus.Deleted,
        }),
        '3': getDummyAnnotation(3, VisionAPIType.TagDetection, {
          status: AnnotationStatus.Verified,
        }),
        '4': getDummyAnnotation(4, VisionAPIType.ObjectDetection, {
          text: 'person',
          status: AnnotationStatus.Verified,
        }),
        '5': getDummyAnnotation(5, VisionAPIType.ObjectDetection),
        '6': getDummyAnnotation(6, VisionAPIType.ObjectDetection, {
          text: 'person',
        }),
        '7': getDummyAnnotation(7, VisionAPIType.TagDetection, {
          status: AnnotationStatus.Rejected,
        }),
      }
    );
    expect(selectProcessSummary(rootState).totalProcessed).toEqual(4);
    expect(selectProcessSummary(rootState).totalWithExif).toEqual(2);
    expect(selectProcessSummary(rootState).totalUserReviewedFiles).toEqual(3);
    expect(selectProcessSummary(rootState).totalModelDetected).toEqual(3);
    expect(selectProcessSummary(rootState).fileCountsByAnnotationType).toEqual({
      assets: 2,
      text: 1,
      objects: 2,
    });
    expect(
      selectProcessSummary(rootState).filePercentagesByAnnotationType
    ).toEqual({
      assets: 50,
      text: 25,
      objects: 50,
    });
  });

  it('should return summary correctly when same file contain person annotation and object annotation', () => {
    const fileIds = [1, 2];
    const rootState = getRootState(
      fileIds,
      {
        1: [1, 2],
      },
      {
        '1': getDummyAnnotation(1, VisionAPIType.ObjectDetection),
        '2': getDummyAnnotation(2, VisionAPIType.ObjectDetection, {
          text: 'person',
        }),
      }
    );
    expect(selectProcessSummary(rootState).totalProcessed).toEqual(2);
    expect(selectProcessSummary(rootState).totalWithExif).toEqual(2);
    expect(selectProcessSummary(rootState).totalUserReviewedFiles).toEqual(0);
    expect(selectProcessSummary(rootState).totalModelDetected).toEqual(1);
    expect(selectProcessSummary(rootState).fileCountsByAnnotationType).toEqual({
      assets: 0,
      text: 0,
      objects: 1,
    });
    expect(
      selectProcessSummary(rootState).filePercentagesByAnnotationType
    ).toEqual({
      assets: 0,
      text: 0,
      objects: 50,
    });
  });

  /**
   * Deleted Annotation status is considered same as 'Rejected'
   */
  it('should return summary correctly when some files contain rejected or verified annotations', () => {
    const fileIds = [1, 2, 3, 4, 5];
    const rootState = getRootState(
      fileIds,
      {
        1: [1, 2],
        2: [3],
        3: [4],
        4: [5],
      },
      {
        '1': getDummyAnnotation(1, VisionAPIType.TagDetection, {
          status: AnnotationStatus.Verified,
        }),
        '2': getDummyAnnotation(2, VisionAPIType.ObjectDetection, {
          text: 'person',
        }),
        '3': getDummyAnnotation(3, VisionAPIType.OCR, {
          status: AnnotationStatus.Rejected,
        }),
        '4': getDummyAnnotation(4, VisionAPIType.ObjectDetection),
        '5': getDummyAnnotation(5, VisionAPIType.OCR, {
          status: AnnotationStatus.Deleted,
        }),
      }
    );
    expect(selectProcessSummary(rootState).totalProcessed).toEqual(5);
    expect(selectProcessSummary(rootState).totalWithExif).toEqual(2);
    expect(selectProcessSummary(rootState).totalUserReviewedFiles).toEqual(3);
    expect(selectProcessSummary(rootState).totalModelDetected).toEqual(4);
    expect(selectProcessSummary(rootState).fileCountsByAnnotationType).toEqual({
      assets: 1,
      text: 2,
      objects: 2,
    });
    expect(
      selectProcessSummary(rootState).filePercentagesByAnnotationType
    ).toEqual({
      assets: 20,
      text: 40,
      objects: 40,
    });
  });

  it('should return summary correctly when files count percentages are non terminating decimals', () => {
    const fileIds = [1, 2, 3];
    const rootState = getRootState(
      fileIds,
      {
        1: [1],
        2: [2, 3],
        3: [4],
      },
      {
        '1': getDummyAnnotation(1),
        '2': getDummyAnnotation(2, VisionAPIType.ObjectDetection, {
          text: 'person',
          status: AnnotationStatus.Verified,
        }),
        '3': getDummyAnnotation(3, VisionAPIType.ObjectDetection),
        '4': getDummyAnnotation(4, VisionAPIType.TagDetection),
      }
    );
    expect(selectProcessSummary(rootState).totalProcessed).toEqual(3);
    expect(selectProcessSummary(rootState).totalWithExif).toEqual(2);
    expect(selectProcessSummary(rootState).totalUserReviewedFiles).toEqual(1);
    expect(selectProcessSummary(rootState).totalModelDetected).toEqual(3);
    expect(selectProcessSummary(rootState).fileCountsByAnnotationType).toEqual({
      assets: 1,
      text: 1,
      objects: 1,
    });
    expect(
      selectProcessSummary(rootState).filePercentagesByAnnotationType
    ).toEqual({
      assets: 33,
      text: 33,
      objects: 33,
    });
  });
  it('should return summary correctly when no files are available', () => {
    const fileIds: number[] = [];
    const rootState = getRootState(fileIds, {}, {});
    expect(selectProcessSummary(rootState).totalProcessed).toEqual(0);
    expect(selectProcessSummary(rootState).totalWithExif).toEqual(0);
    expect(selectProcessSummary(rootState).totalUserReviewedFiles).toEqual(0);
    expect(selectProcessSummary(rootState).totalModelDetected).toEqual(0);
    expect(selectProcessSummary(rootState).fileCountsByAnnotationType).toEqual({
      assets: 0,
      text: 0,
      objects: 0,
    });
    expect(
      selectProcessSummary(rootState).filePercentagesByAnnotationType
    ).toEqual({
      assets: 0,
      text: 0,
      objects: 0,
    });
  });

  it('should return summary correctly when no annotations are available', () => {
    const fileIds = [1, 2, 3];
    const rootState = getRootState(fileIds, {}, {});
    expect(selectProcessSummary(rootState).totalProcessed).toEqual(3);
    expect(selectProcessSummary(rootState).totalWithExif).toEqual(2);
    expect(selectProcessSummary(rootState).totalUserReviewedFiles).toEqual(0);
    expect(selectProcessSummary(rootState).totalModelDetected).toEqual(0);
    expect(
      selectProcessSummary(rootState).filePercentagesByAnnotationType
    ).toEqual({
      assets: 0,
      text: 0,
      objects: 0,
    });
  });
});
