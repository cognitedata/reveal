import {
  AnnotationsBadgeStatuses,
  CellRenderer,
} from 'src/modules/Common/types';
import React, { useMemo } from 'react';
import { makeSelectJobStatusForFile } from 'src/modules/Process/processSlice';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { TimeDisplay } from '@cognite/data-exploration';

export function StatusRenderer({ rowData: { id } }: CellRenderer) {
  const getAnnotationStatuses = useMemo(makeSelectJobStatusForFile, []);
  const annotationStatuses = useSelector(({ processSlice }: RootState) =>
    getAnnotationStatuses(processSlice, id)
  );

  const statuses = Object.keys(annotationStatuses) as Array<
    keyof AnnotationsBadgeStatuses
  >;

  if (
    statuses.some((key) => annotationStatuses[key]?.status === 'Completed') &&
    !statuses.some((key) =>
      ['Running', 'Queued'].includes(annotationStatuses[key]?.status || '')
    )
  ) {
    let statusTime = 0;
    if (statuses.length) {
      statusTime = Math.max(
        ...statuses.map((key) => annotationStatuses[key]?.statusTime || 0)
      );
    }

    return (
      <div>
        Processed <TimeDisplay value={statusTime} relative withTooltip />
      </div>
    );
  }
  if (statuses.some((key) => annotationStatuses[key]?.status === 'Running')) {
    return <div style={{ textTransform: 'capitalize' }}>Running</div>;
  }

  if (statuses.some((key) => annotationStatuses[key]?.status === 'Queued')) {
    return <div style={{ textTransform: 'capitalize' }}>Queued</div>;
  }

  if (statuses.some((key) => annotationStatuses[key]?.status === 'Failed')) {
    return <div style={{ textTransform: 'capitalize' }}>Failed</div>;
  }

  return <div style={{ textTransform: 'capitalize' }}>Unprocessed</div>;
}
