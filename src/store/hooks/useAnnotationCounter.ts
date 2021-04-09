import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { getAnnotationCountByModelType } from 'src/store/previewSlice';
import { JobStatus, VisionAPIType } from 'src/api/types';
import { AnnotationsBadgeProps } from 'src/pages/Workflow/types';
import { selectJobsByFileId } from 'src/store/processSlice';
import { getFileJobsResultingStatus } from 'src/pages/Workflow/components/FileTable/getFileJobsResultingStatus';

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
      textAndObjects: getAnnotationCountByModelType(
        state.previewSlice,
        fileId.toString(),
        [VisionAPIType.OCR, VisionAPIType.ObjectDetection]
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
    textAndObjects: {
      ...counts.textAndObjects,
      status: getFileJobsResultingStatus([
        { status: statusJobMap.get(VisionAPIType.OCR)?.status as JobStatus },
        {
          status: statusJobMap.get(VisionAPIType.ObjectDetection)
            ?.status as JobStatus,
        },
      ]),
      statusTime: statusJobMap.get(VisionAPIType.OCR)?.statusTime, // BUG: should take bothe statusTimes into account
    },
  } as AnnotationsBadgeProps;

  return annotationsBadgeProps;
};
