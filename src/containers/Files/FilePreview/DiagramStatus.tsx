import React, { useState, useEffect } from 'react';
import { FileInfo } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Icon, Label, LabelVariants } from '@cognite/cogs.js';
import { Tooltip } from 'antd';
import {
  PENDING_LABEL,
  INTERACTIVE_LABEL,
  isFileApproved,
  isFilePending,
} from '../hooks';

type Props = { fileId: number };

export type ReviewStatus = {
  status: string;
  variant: LabelVariants;
  label: string;
  tooltip: string;
};

export const approvalDetails: { [key: string]: ReviewStatus } = {
  pending: {
    status: PENDING_LABEL.externalId,
    variant: 'warning',
    label: 'Pending approval',
    tooltip: 'New detected tags that need to be reviewed',
  },
  approved: {
    status: INTERACTIVE_LABEL.externalId,
    variant: 'success',
    label: 'Approved',
    tooltip: 'All tags have been reviewed',
  },
  unknown: {
    status: 'No tags detected',
    variant: 'unknown',
    label: 'No tags detected',
    tooltip: 'No tags were found in the diagram',
  },
};
export default function DiagramReviewStatus({ fileId }: Props) {
  const [fileStatus, setFileStatus] = useState<ReviewStatus>(
    approvalDetails.unknown
  );

  const { data: file, isFetched, error } = useCdfItem<FileInfo>('files', {
    id: fileId,
  });

  useEffect(() => {
    if (!file) {
      return;
    }
    if (isFileApproved(file)) {
      setFileStatus(approvalDetails.approved);
    } else if (isFilePending(file)) {
      setFileStatus(approvalDetails.pending);
    } else if (error) {
      setFileStatus(approvalDetails.unknown);
    } else {
      setFileStatus(approvalDetails.unknown);
    }
  }, [error, file]);

  return (
    <Tooltip title={fileStatus.tooltip}>
      <Label size="small" variant={fileStatus.variant}>
        {isFetched ? fileStatus.label : <Icon type="Loader" />}
      </Label>
    </Tooltip>
  );
}
