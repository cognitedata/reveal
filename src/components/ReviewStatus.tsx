import React, { useState, useEffect } from 'react';
import { FileInfo } from '@cognite/sdk';
import { Label } from '@cognite/cogs.js';
import { ReviewStatus, approvalDetails } from 'components/Filters';
import { isFileApproved, isFilePending } from 'hooks';

type Props = { file: FileInfo };

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
