import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { AnnotationsBadgePopover } from '@vision/modules/Common/Components/AnnotationsBadge/AnnotationBadgePopover';
import { makeSelectTotalAnnotationCountForFileIds } from '@vision/modules/Common/store/annotation/selectors';
import { CellRenderer } from '@vision/modules/Common/types';
import { makeSelectJobStatusForFile } from '@vision/modules/Process/store/selectors';
import { RootState } from '@vision/store/rootReducer';

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
