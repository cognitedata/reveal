import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { AnnotationsBadgePopover } from '@vision/modules/Common/Components/AnnotationsBadge/AnnotationBadgePopover';
import { makeSelectTotalAnnotationCountForFileIds } from '@vision/modules/Common/store/annotation/selectors';
import { CellRenderer } from '@vision/modules/Common/types';
import { calculateBadgeCountsDifferences } from '@vision/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import { makeSelectJobStatusForFile } from '@vision/modules/Process/store/selectors';
import { RootState } from '@vision/store/rootReducer';

export function FilteredAnnotationsRenderer({
  rowData: { id, annotationFilter },
}: CellRenderer) {
  const selectTotalAnnotationCountForFileIds = useMemo(
    makeSelectTotalAnnotationCountForFileIds,
    []
  );

  const allAnnotationCounts = useSelector(({ annotationReducer }: RootState) =>
    selectTotalAnnotationCountForFileIds(annotationReducer, [id])
  );

  const filteredAnnotationCounts = useSelector(
    ({ annotationReducer }: RootState) =>
      selectTotalAnnotationCountForFileIds(
        annotationReducer,
        [id],
        annotationFilter
      )
  );

  const remainingAnnotationCounts = calculateBadgeCountsDifferences(
    allAnnotationCounts,
    filteredAnnotationCounts
  );

  const selectAnnotationStatuses = useMemo(makeSelectJobStatusForFile, []);
  const annotationStatuses = useSelector(({ processSlice }: RootState) =>
    selectAnnotationStatuses(processSlice, id)
  );

  return AnnotationsBadgePopover(remainingAnnotationCounts, annotationStatuses);
}
