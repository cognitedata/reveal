import { AnnotatedResourceId, Status } from 'src/api/annotation/types';
import { VisionAnnotation } from 'src/modules/Common/types';

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
