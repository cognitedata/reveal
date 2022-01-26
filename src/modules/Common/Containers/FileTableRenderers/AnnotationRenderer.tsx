import { useMemo } from 'react';
import { makeSelectAnnotationCounts } from 'src/modules/Common/store/annotation/selectors';
import { CellRenderer } from 'src/modules/Common/types';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { makeSelectJobStatusForFile } from 'src/modules/Process/processSlice';
import { AnnotationsBadgePopover } from 'src/modules/Common/Components/AnnotationsBadge/AnnotationBadgePopover';

export function AnnotationRenderer({ rowData: { id } }: CellRenderer) {
  const selectAnnotationCounts = useMemo(makeSelectAnnotationCounts, []);
  const annotationCounts = useSelector(({ annotationReducer }: RootState) =>
    selectAnnotationCounts(annotationReducer, id)
  );

  const selectAnnotationStatuses = useMemo(makeSelectJobStatusForFile, []);
  const annotationStatuses = useSelector(({ processSlice }: RootState) =>
    selectAnnotationStatuses(processSlice, id)
  );

  return AnnotationsBadgePopover(annotationCounts, annotationStatuses);
}
