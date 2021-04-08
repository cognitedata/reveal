import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { getAnnotationCountByModelType } from 'src/store/previewSlice';
import { DetectionModelType } from 'src/api/types';
import { AnnotationsBadgeProps } from 'src/pages/Workflow/types';
import { selectJobsByFileId } from 'src/store/processSlice';

export const useAnnotationCounter = (fileId: number) => {
  console.log('Calling selector');
  const jobs = useSelector((state: RootState) =>
    selectJobsByFileId(state.processSlice, fileId)
  );
  const statusJobMap = new Map(jobs.map((i) => [i.type, i.status]));

  const counts = useSelector((state: RootState) => {
    console.log('Counter selector');
    return {
      gdpr: getAnnotationCountByModelType(
        state.previewSlice,
        fileId.toString(),
        DetectionModelType.GDPR
      ),
      tag: getAnnotationCountByModelType(
        state.previewSlice,
        fileId.toString(),
        DetectionModelType.Tag
      ),
      textAndObjects: getAnnotationCountByModelType(
        state.previewSlice,
        fileId.toString(),
        DetectionModelType.Text
      ),
    };
  }, shallowEqual);

  const annotationsBadgeProps = {
    gdpr: {
      ...counts.gdpr,
      status: statusJobMap.get(DetectionModelType.GDPR),
    },
    tag: {
      ...counts.tag,
      status: statusJobMap.get(DetectionModelType.Tag),
    },
    textAndObjects: {
      ...counts.textAndObjects,
      status: statusJobMap.get(DetectionModelType.Text),
    },
  } as AnnotationsBadgeProps;

  return annotationsBadgeProps;
};
