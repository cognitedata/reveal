import { useMemo } from 'react';
import { makeSelectTotalAnnotationCountForFileIds } from 'src/modules/Common/store/annotationV1/selectors';
import { CellRenderer } from 'src/modules/Common/types';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { makeSelectJobStatusForFile } from 'src/modules/Process/store/selectors';
import { AnnotationsBadgePopover } from 'src/modules/Common/Components/AnnotationsBadge/AnnotationBadgePopover';
import { calculateBadgeCountsDifferences } from 'src/utils/AnnotationUtils';

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
