import { CellRenderer } from 'src/modules/Common/types';
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { Popover } from 'src/modules/Common/Components/Popover';
import { AnnotationsBadgePopoverContent } from 'src/modules/Common/Components/AnnotationsBadge/AnnotationsBadgePopoverContent';
import { AnnotationsBadge } from 'src/modules/Common/Components/AnnotationsBadge/AnnotationsBadge';
import { RetrieveAnnotations } from 'src/store/thunks/RetrieveAnnotations';
import { makeGetAnnotationStatuses } from 'src/modules/Process/processSlice';
import { makeGetAnnotationCounts } from '../../annotationSlice';

export function AnnotationRenderer({ rowData: { id } }: CellRenderer) {
  const dispatch = useDispatch();

  const getAnnotationCounts = useMemo(makeGetAnnotationCounts, []);
  const annotationCounts = useSelector(({ annotationReducer }: RootState) =>
    getAnnotationCounts(annotationReducer, id)
  );

  const getAnnotationStatuses = useMemo(makeGetAnnotationStatuses, []);
  const annotationStatus = useSelector(({ processSlice }: RootState) =>
    getAnnotationStatuses(processSlice, id)
  );

  useEffect(() => {
    dispatch(RetrieveAnnotations({ fileId: id, assetIds: undefined }));
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
