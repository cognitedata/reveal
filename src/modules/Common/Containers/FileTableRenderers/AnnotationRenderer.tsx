import { CellRenderer } from 'src/modules/Common/Types';
import React, { useMemo } from 'react';
import { makeAnnotationBadgePropsByFileId } from 'src/modules/Process/processSlice';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { Popover } from 'src/modules/Common/Components/Popover';
import { AnnotationsBadgePopoverContent } from 'src/modules/Common/Components/AnnotationsBadge/AnnotationsBadgePopoverContent';
import { AnnotationsBadge } from 'src/modules/Common/Components/AnnotationsBadge/AnnotationsBadge';

export function AnnotationRenderer({ rowData: { id } }: CellRenderer) {
  const selectAnnotationBadgeProps = useMemo(
    makeAnnotationBadgePropsByFileId,
    []
  );
  const annotationsBadgeProps = useSelector((state: RootState) =>
    selectAnnotationBadgeProps(state, id)
  );
  return (
    <Popover
      placement="bottom"
      trigger="mouseenter click"
      content={AnnotationsBadgePopoverContent(annotationsBadgeProps)}
    >
      <>{AnnotationsBadge(annotationsBadgeProps)}</>
    </Popover>
  );
}
