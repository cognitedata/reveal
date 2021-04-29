import { CellRenderer } from 'src/modules/Common/Types';
import React, { useMemo } from 'react';
import { makeAnnotationBadgePropsByFileId } from 'src/modules/Process/processSlice';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { AnnotationsBadgeProps } from 'src/modules/Workflow/types';
import { TimeDisplay } from '@cognite/data-exploration';

export function StatusRenderer({ rowData: { id } }: CellRenderer) {
  const selectAnnotationBadgeProps = useMemo(
    makeAnnotationBadgePropsByFileId,
    []
  );
  const annotationsBadgeProps = useSelector((state: RootState) =>
    selectAnnotationBadgeProps(state, id)
  );

  const annotations = Object.keys(annotationsBadgeProps) as Array<
    keyof AnnotationsBadgeProps
  >;

  if (
    annotations.some(
      (key) => annotationsBadgeProps[key]?.status === 'Completed'
    ) &&
    !annotations.some((key) =>
      ['Running', 'Queued'].includes(annotationsBadgeProps[key]?.status || '')
    )
  ) {
    let statusTime = 0;
    if (annotations.length) {
      statusTime = Math.max(
        ...annotations.map((key) => annotationsBadgeProps[key]?.statusTime || 0)
      );
    }

    return (
      <div>
        Processed <TimeDisplay value={statusTime} relative withTooltip />
      </div>
    );
  }
  if (
    annotations.some((key) => annotationsBadgeProps[key]?.status === 'Running')
  ) {
    return <div style={{ textTransform: 'capitalize' }}>Running</div>;
  }

  if (
    annotations.some((key) => annotationsBadgeProps[key]?.status === 'Queued')
  ) {
    return <div style={{ textTransform: 'capitalize' }}>Queued</div>;
  }

  return <div style={{ textTransform: 'capitalize' }}>Unprocessed</div>;
}
