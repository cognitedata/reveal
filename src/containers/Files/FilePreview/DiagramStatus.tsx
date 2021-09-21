import React, { useState, useEffect } from 'react';
import { FileInfo } from '@cognite/sdk';
import { Label, LabelVariants } from '@cognite/cogs.js';
import { Tooltip } from 'antd';
import {
  PENDING_LABEL,
  INTERACTIVE_LABEL,
  isFileApproved,
  isFilePending,
} from '../hooks';

type Props = { file?: FileInfo };

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
    status: 'N\\A',
    variant: 'unknown',
    label: 'N\\A',
    tooltip: 'No tags were found in the diagram',
  },
};
export default function DiagramReviewStatus({ file }: Props) {
  const [fileStatus, setFileStatus] = useState<ReviewStatus>(
    approvalDetails.unknown
  );
  useEffect(() => {
    if (file) {
      if (isFileApproved(file)) {
        setFileStatus(approvalDetails.approved);
      } else if (isFilePending(file)) {
        setFileStatus(approvalDetails.pending);
      }
    }
  }, [file]);

  return (
    <Tooltip title={fileStatus.tooltip}>
      <Label size="small" variant={fileStatus.variant}>
        {fileStatus.label}
      </Label>
    </Tooltip>
  );
}
