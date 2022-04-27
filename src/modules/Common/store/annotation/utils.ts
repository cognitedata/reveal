import {
  ImageObjectDetectionBoundingBox,
  Status,
} from 'src/api/annotation/types';
import { VisionAnnotation } from 'src/modules/Common/types/index';
import { createVisionAnnotationStub } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';

export const getDummyImageObjectDetectionBoundingBoxAnnotation = ({
  id = 1,
  annotatedResourceId = 10,
}: {
  id?: number;
  annotatedResourceId?: number;
}): VisionAnnotation<ImageObjectDetectionBoundingBox> => {
  const data: ImageObjectDetectionBoundingBox = {
    label: 'pump',
    boundingBox: {
      xMin: 0.25,
      yMin: 0.25,
      xMax: 0.75,
      yMax: 0.75,
    },
  };

  return createVisionAnnotationStub<ImageObjectDetectionBoundingBox>({
    id,
    createdTime: 123,
    lastUpdatedTime: 123,
    status: Status.Suggested,
    resourceId: { annotatedResourceId },
    data,
  });
};
