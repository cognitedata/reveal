import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../../store/rootReducer';
import { makeSelectJobStatusForFile } from '../../../Process/store/selectors';
import { AnnotationsBadgePopover } from '../../Components/AnnotationsBadge/AnnotationBadgePopover';
import { makeSelectTotalAnnotationCountForFileIds } from '../../store/annotation/selectors';
import { CellRenderer } from '../../types';

export function AnnotationRenderer({ rowData: { id } }: CellRenderer) {
  const selectTotalAnnotationCountForFileIds = useMemo(
    makeSelectTotalAnnotationCountForFileIds,
    []
  );
  const annotationCounts = useSelector(({ annotationReducer }: RootState) =>
    selectTotalAnnotationCountForFileIds(annotationReducer, [id])
  );

  const selectAnnotationStatuses = useMemo(makeSelectJobStatusForFile, []);
  const annotationStatuses = useSelector(({ processSlice }: RootState) =>
    selectAnnotationStatuses(processSlice, id)
  );

  return AnnotationsBadgePopover(annotationCounts, annotationStatuses);
}
