/* eslint-disable jest/no-disabled-tests */
import { ReviewState } from 'src/modules/Review/store/review/types';

import { initialState as filesInitialState } from 'src/modules/Common/store/files/slice';
import { initialState as reviewInitialState } from 'src/modules/Review/store/review/slice';
import { initialState as annotationInitialState } from 'src/modules/Common/store/annotation/slice';
import { initialState as annotatorWrapperInitialState } from 'src/modules/Review/store/annotatorWrapper/slice';

import { AnnotationSettingsOption } from 'src/modules/Review/store/review/enums';
import {
  selectAllReviewFiles,
  selectAnnotationSettingsState,
  selectVisionReviewAnnotationsForFile,
  selectNonRejectedVisionReviewAnnotationsForFile,
} from 'src/modules/Review/store/review/selectors';
import { FileState } from 'src/modules/Common/store/files/types';
import { createFileState } from 'src/store/util/StateUtils';
import { mockFileList } from 'src/__test-utils/fixtures/files';
import { RootState } from 'src/store/rootReducer';
import { AnnotationState } from 'src/modules/Common/store/annotation/types';
import { AnnotatorWrapperState } from 'src/modules/Review/store/annotatorWrapper/type';
import {
  getDummyImageObjectDetectionBoundingBoxAnnotation,
  getDummyImageKeypointCollectionAnnotation,
} from 'src/__test-utils/getDummyAnnotations';
import { CDFAnnotationTypeEnum, Status } from 'src/api/annotation/types';

const mockFilesState: FileState = {
  files: {
    allIds: [1, 2, 3],
    byId: {
      1: createFileState(mockFileList[0]),
      2: createFileState(mockFileList[1]),
      3: createFileState(mockFileList[2]),
    },
    selectedIds: [0],
  },
};

const mockReviewState: ReviewState = {
  ...reviewInitialState,
  fileIds: [1, 2],
  hiddenAnnotationIds: [100],
  selectedAnnotationIds: [200, 400, 500, 600],
  annotationSettings: {
    show: true,
    activeView: AnnotationSettingsOption.KEYPOINT,
    createNew: {
      text: 'new annotation',
      color: 'red',
    },
  },
  scrollToId: 'scroll_id',
};

const dummyAnnotation100 = getDummyImageObjectDetectionBoundingBoxAnnotation({
  id: 100,
});
const dummyAnnotation200 = getDummyImageObjectDetectionBoundingBoxAnnotation({
  id: 200,
});
const dummyAnnotation300 = getDummyImageKeypointCollectionAnnotation({
  id: 300,
});
const dummyAnnotation400 = getDummyImageObjectDetectionBoundingBoxAnnotation({
  id: 400,
  status: Status.Rejected,
});

const mockAnnotationState: AnnotationState = {
  files: {
    byId: {
      '1': [100, 200, 300, 400],
    },
  },
  annotations: {
    byId: {
      '100': dummyAnnotation100,
      '200': dummyAnnotation200,
      '300': dummyAnnotation300,
      '400': dummyAnnotation400,
    },
  },
  // both keypoints have same label
  annotationColorMap: {
    [dummyAnnotation100.label]: '#f00',
  },
};

const mockAnnotatorWrapperState: AnnotatorWrapperState = {
  ...annotatorWrapperInitialState,
};

const mockRootState: RootState = {
  fileReducer: mockFilesState,
  reviewSlice: mockReviewState,
  annotationReducer: mockAnnotationState,
  annotatorWrapperReducer: mockAnnotatorWrapperState,
} as RootState;

describe('Test Review selectors', () => {
  describe('selectAllReviewFiles selector', () => {
    test('when file ids are empty', () => {
      expect(
        selectAllReviewFiles({
          fileReducer: mockFilesState,
          reviewSlice: { ...mockReviewState, fileIds: [] } as ReviewState,
        } as RootState)
      ).toEqual([]);
    });

    test('when file ids are available', () => {
      const selectedFiles = selectAllReviewFiles({
        fileReducer: mockFilesState,
        reviewSlice: mockReviewState,
      } as RootState);
      expect(selectedFiles.map((file) => file.id)).toEqual([1, 2]);
    });

    test('when some files are not available in file reducer', () => {
      const selectedFiles = selectAllReviewFiles({
        fileReducer: mockFilesState,
        reviewSlice: {
          ...mockReviewState,
          fileIds: [1, 2, 5],
        } as ReviewState,
      } as RootState);
      expect(selectedFiles.map((file) => file.id)).toEqual([1, 2]);
    });
  });

  describe('selectAnnotationSettingsState selector', () => {
    test('get initial annotation settings', () => {
      const annotationSettings =
        selectAnnotationSettingsState(reviewInitialState);
      expect(annotationSettings.show).toEqual(false);
      expect(annotationSettings.createNew.text).toEqual(undefined);
      expect(annotationSettings.createNew.color).toEqual(undefined);
      expect(annotationSettings.activeView).toEqual(
        AnnotationSettingsOption.SHAPE
      );
    });

    test('open annotation settings without a create new', () => {
      const annotationSettings = selectAnnotationSettingsState({
        ...mockReviewState,
        annotationSettings: {
          ...mockReviewState.annotationSettings,
          createNew: {},
        },
      });
      expect(annotationSettings.show).toEqual(true);
      expect(annotationSettings.createNew).toEqual({});
      expect(annotationSettings.createNew.text).toEqual(undefined);
      expect(annotationSettings.createNew.color).toEqual(undefined);
      expect(annotationSettings.activeView).toEqual(
        AnnotationSettingsOption.KEYPOINT
      );
    });

    test('open annotation settings with a create new', () => {
      const annotationSettings = selectAnnotationSettingsState(mockReviewState);
      expect(annotationSettings.show).toEqual(true);
      expect(annotationSettings.createNew).not.toEqual({});
      expect(annotationSettings.createNew.text).toEqual('new annotation');
      expect(annotationSettings.createNew.color).toEqual('red');
      expect(annotationSettings.activeView).toEqual(
        AnnotationSettingsOption.KEYPOINT
      );
    });
  });

  describe('selectVisionReviewAnnotationsForFile selector', () => {
    test('return empty to initial state', () => {
      const selectedAnnotations = selectVisionReviewAnnotationsForFile(
        {
          fileReducer: filesInitialState,
          reviewSlice: reviewInitialState,
          annotationReducer: annotationInitialState,
          annotatorWrapperReducer: annotatorWrapperInitialState,
        } as RootState,
        1
      );
      expect(selectedAnnotations).toStrictEqual([]);
    });

    test("return empty to selected file don't have annotations", () => {
      const selectedAnnotations = selectVisionReviewAnnotationsForFile(
        mockRootState,
        2
      );
      expect(selectedAnnotations).toStrictEqual([]);
    });

    describe('file with annotations', () => {
      const fileId = 1;

      const selectedAnnotations = selectVisionReviewAnnotationsForFile(
        mockRootState,
        fileId
      );

      test('has correct show status', () => {
        expect(
          selectedAnnotations.map((annotation) => annotation.annotation.id)
        ).toContain(100);

        expect(
          selectedAnnotations.find(
            (annotation) => annotation.annotation.id === 100
          )?.show
        ).toBe(false);

        expect(
          selectedAnnotations.find(
            (annotation) => annotation.annotation.id === 200
          )?.show
        ).toBe(true);
      });

      test('has correct select status', () => {
        expect(
          selectedAnnotations.map((annotation) => annotation.annotation.id)
        ).toContain(100);

        expect(
          selectedAnnotations.find(
            (annotation) => annotation.annotation.id === 100
          )?.selected
        ).toBe(false);

        expect(
          selectedAnnotations.find(
            (annotation) => annotation.annotation.id === 200
          )?.selected
        ).toBe(true);
      });

      test('has correct color', () => {
        expect(
          selectedAnnotations.map((annotation) => annotation.annotation.id)
        ).toContain(100);

        expect(
          selectedAnnotations.find(
            (annotation) => annotation.annotation.id === 100
          )?.color
        ).toBe('#f00');
      });

      test('keypoint collection', () => {
        const keypointCollection = selectedAnnotations.find(
          (annotation) => annotation.annotation.id === 300
        )?.annotation;

        expect(keypointCollection?.annotationType).toBe(
          CDFAnnotationTypeEnum.ImagesKeypointCollection
        );
      });
    });
  });

  describe('selectNonRejectedVisionReviewAnnotationsForFile selector', () => {
    const selectedAnnotations = selectNonRejectedVisionReviewAnnotationsForFile(
      mockRootState,
      1
    );

    test('should not contain rejected annotations', () => {
      expect(
        selectedAnnotations.find(
          (annotation) => annotation.annotation.id === 400
        )
      ).toBe(undefined);
    });

    test('should not contain hidden', () => {
      expect(
        selectedAnnotations.find(
          (annotation) => annotation.annotation.id === 100
        )
      ).toBe(undefined);
    });

    test('should contain all non rejected annotations', () => {
      expect(selectedAnnotations.length).toBe(2);
    });
  });
});
