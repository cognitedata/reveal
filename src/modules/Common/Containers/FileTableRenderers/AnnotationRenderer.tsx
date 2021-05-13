import { CellRenderer } from 'src/modules/Common/types';
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { Popover } from 'src/modules/Common/Components/Popover';
import { AnnotationsBadgePopoverContent } from 'src/modules/Common/Components/AnnotationsBadge/AnnotationsBadgePopoverContent';
import { AnnotationsBadge } from 'src/modules/Common/Components/AnnotationsBadge/AnnotationsBadge';
import { RetrieveAnnotations } from 'src/store/thunks/RetrieveAnnotations';
import { makeSelectAnnotationStatuses } from 'src/modules/Process/processSlice';
import { makeSelectAnnotationCounts } from '../../annotationSlice';

export function AnnotationRenderer({ rowData: { id } }: CellRenderer) {
  const dispatch = useDispatch();

  const selectAnnotationCounts = useMemo(makeSelectAnnotationCounts, []);
  const annotationCounts = useSelector(({ annotationReducer }: RootState) =>
    selectAnnotationCounts(annotationReducer, id)
  );

  const selectAnnotationStatuses = useMemo(makeSelectAnnotationStatuses, []);
  const annotationStatus = useSelector(({ processSlice }: RootState) =>
    selectAnnotationStatuses(processSlice, id)
  );

  useEffect(() => {
    dispatch(RetrieveAnnotations({ fileIds: [id], assetIds: undefined }));
  }, []);

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
