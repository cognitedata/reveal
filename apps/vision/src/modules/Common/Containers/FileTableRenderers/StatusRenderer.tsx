import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { TimeDisplay } from '@data-exploration/components';
import {
  AnnotationsBadgeStatuses,
  CellRenderer,
} from '@vision/modules/Common/types';
import { makeSelectJobStatusForFile } from '@vision/modules/Process/store/selectors';
import { RootState } from '@vision/store/rootReducer';

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
