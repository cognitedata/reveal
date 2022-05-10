import {
  AnnotatedResourceId,
  CDFAnnotationTypeEnum,
  CDFAnnotationV2,
  Status,
} from 'src/api/annotation/types';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';

export const createVisionAnnotationStub = <T>({
  id,
  createdTime,
  lastUpdatedTime,
  status = Status.Suggested,
  resourceId,
  data,
}: {
  id: number;
  createdTime: number;
  lastUpdatedTime: number;
  status: Status;
  resourceId: AnnotatedResourceId;
  data: T;
}): VisionAnnotation<T> => ({
  id,
  createdTime,
  lastUpdatedTime,
  status,
  ...resourceId,
  ...data,
});

export const convertToVisionAnnotations = (
  ann: CDFAnnotationV2<CDFAnnotationTypeEnum>[]
): VisionAnnotation<VisionAnnotationDataType>[] => {
  console.warn('havent finished yet');

  return [] as VisionAnnotation<VisionAnnotationDataType>[];
};
