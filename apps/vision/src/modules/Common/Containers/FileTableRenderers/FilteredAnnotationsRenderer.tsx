import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../../store/rootReducer';
import { makeSelectJobStatusForFile } from '../../../Process/store/selectors';
import { AnnotationsBadgePopover } from '../../Components/AnnotationsBadge/AnnotationBadgePopover';
import { makeSelectTotalAnnotationCountForFileIds } from '../../store/annotation/selectors';
import { CellRenderer } from '../../types';
import { calculateBadgeCountsDifferences } from '../../Utils/AnnotationUtils/AnnotationUtils';

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
