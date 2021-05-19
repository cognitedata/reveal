import { CellRenderer } from 'src/modules/Common/types';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { Popover } from 'src/modules/Common/Components/Popover';
import { AnnotationsBadgePopoverContent } from 'src/modules/Common/Components/AnnotationsBadge/AnnotationsBadgePopoverContent';
import { AnnotationsBadge } from 'src/modules/Common/Components/AnnotationsBadge/AnnotationsBadge';
import { makeSelectAnnotationStatuses } from 'src/modules/Process/processSlice';
import { makeSelectAnnotationCounts } from '../../annotationSlice';

export function AnnotationRenderer({ rowData: { id } }: CellRenderer) {
  const selectAnnotationCounts = useMemo(makeSelectAnnotationCounts, []);
  const annotationCounts = useSelector(({ annotationReducer }: RootState) =>
    selectAnnotationCounts(annotationReducer, id)
  );

  const selectAnnotationStatuses = useMemo(makeSelectAnnotationStatuses, []);
  const annotationStatus = useSelector(({ processSlice }: RootState) =>
    selectAnnotationStatuses(processSlice, id)
  );

  return (
    <Popover
      placement="bottom"
      trigger="mouseenter click"
      content={AnnotationsBadgePopoverContent(
        annotationCounts,
        annotationStatus
      )}
    >
      <>{AnnotationsBadge(annotationCounts, annotationStatus)}</>
    </Popover>
  );
}
