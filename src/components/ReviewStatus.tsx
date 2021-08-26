import React, { useState, useEffect } from 'react';
import {
  PENDING_LABEL,
  INTERACTIVE_LABEL,
  isFileApproved,
  isFilePending,
} from 'hooks/useReviewFiles';
import { FileInfo } from '@cognite/sdk';
import { Label, LabelVariants } from '@cognite/cogs.js';

type Props = { file: FileInfo };

export type ReviewStatus = {
  status: string;
  variant: LabelVariants;
  label: string;
};

export const approvalDetails: { [key: string]: ReviewStatus } = {
  pending: {
    status: PENDING_LABEL.externalId,
    variant: 'warning',
    label: 'Pending approval',
  },
  approved: {
    status: INTERACTIVE_LABEL.externalId,
    variant: 'success',
    label: 'Approved',
  },
  unknown: {
    status: 'No detected tags',
    variant: 'unknown',
    label: 'No detected tags',
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
    <Label size="small" variant={fileStatus.variant}>
      {fileStatus.label}
    </Label>
  );
}
