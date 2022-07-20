import {
  CDFAnnotationTypeEnum,
  ImageObjectDetectionBoundingBox,
  Status,
} from 'src/api/annotation/types';
import { UnsavedVisionAnnotation } from 'src/modules/Common/types';
import { annotationSnapToEdge } from 'src/modules/Review/utils/annotationSnapToEdge';

type DummyImageBoundingBox = Omit<
  UnsavedVisionAnnotation<ImageObjectDetectionBoundingBox>,
  'annotatedResourceId'
>;

const dummyImageBoundingBox: DummyImageBoundingBox = {
  annotationType: CDFAnnotationTypeEnum.ImagesObjectDetection,
  status: Status.Suggested,
  data: {
    label: 'dummy-annotation',
    confidence: 1,
    boundingBox: {
      xMin: 0,
      yMin: 0,
      xMax: 0.5,
      yMax: 0.5,
    },
  },
};

describe('Test annotationSnapToEdge fn', () => {
  describe('for BoundingBoxes', () => {
    test('if all the vertices are inside the image', () => {
      expect(annotationSnapToEdge(dummyImageBoundingBox)).toStrictEqual(
        dummyImageBoundingBox
      );
    });

    describe('if some vertices are outside the image', () => {
      // tests were added only to test xMin as logic is same for all other
      test('negative xMin', () => {
        const inputAnnotation = { ...dummyImageBoundingBox };
        inputAnnotation.data.boundingBox.xMin = -0.5;
        expect(
          (annotationSnapToEdge(inputAnnotation) as DummyImageBoundingBox).data
            .boundingBox.xMin
        ).toStrictEqual(0);
      });

      test('xMin larger than 1', () => {
        const inputAnnotation = { ...dummyImageBoundingBox };
        inputAnnotation.data.boundingBox.xMin = 1.5;
        expect(
          (annotationSnapToEdge(inputAnnotation) as DummyImageBoundingBox).data
            .boundingBox.xMin
        ).toStrictEqual(1);
      });
    });
  });

  // will not add tests for other annotations for now as there is no logic to test there
});
