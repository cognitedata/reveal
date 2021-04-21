import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { getAnnotationCountByModelType } from 'src/store/previewSlice';
import { VisionAPIType } from 'src/api/types';
import { AnnotationsBadgeProps } from 'src/pages/Workflow/types';
import { selectJobsByFileId } from 'src/store/processSlice';

export const useAnnotationCounter = (fileId: number) => {
  // console.log('Calling selector');
  const jobs = useSelector((state: RootState) =>
    selectJobsByFileId(state.processSlice, fileId)
  );
  const statusJobMap = new Map(
    jobs.map((i) => [i.type, { status: i.status, statusTime: i.statusTime }])
  );

  const counts = useSelector((state: RootState) => {
    // console.log('Counter selector');
    return {
      gdpr: getAnnotationCountByModelType(
        state.previewSlice,
        fileId.toString(),
        [VisionAPIType.ObjectDetection],
        true
      ),
      tag: getAnnotationCountByModelType(
        state.previewSlice,
        fileId.toString(),
        [VisionAPIType.TagDetection]
      ),
      text: getAnnotationCountByModelType(
        state.previewSlice,
        fileId.toString(),
        [VisionAPIType.OCR]
      ),
      objects: getAnnotationCountByModelType(
        state.previewSlice,
        fileId.toString(),
        [VisionAPIType.ObjectDetection]
      ),
    };
  }, shallowEqual);

  const annotationsBadgeProps = {
    gdpr: {
      ...counts.gdpr,
      status: statusJobMap.get(VisionAPIType.ObjectDetection)?.status,
      statusTime: statusJobMap.get(VisionAPIType.ObjectDetection)?.statusTime,
    },
    tag: {
      ...counts.tag,
      status: statusJobMap.get(VisionAPIType.TagDetection)?.status,
      statusTime: statusJobMap.get(VisionAPIType.TagDetection)?.statusTime,
    },
    text: {
      ...counts.text,
      status: statusJobMap.get(VisionAPIType.OCR)?.status,
      statusTime: statusJobMap.get(VisionAPIType.OCR)?.statusTime,
    },
    objects: {
      ...counts.objects,
      status: statusJobMap.get(VisionAPIType.ObjectDetection)?.status,
      statusTime: statusJobMap.get(VisionAPIType.ObjectDetection)?.statusTime,
    },
  } as AnnotationsBadgeProps;

  return annotationsBadgeProps;
};
