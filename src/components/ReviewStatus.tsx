import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Label, LabelSize } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { ReviewStatus, approvalDetails } from 'components/Filters';
import { isFileApproved, isFilePending } from 'hooks';

const StyledLabel = styled(Label)`
  white-space: nowrap;
`;

type Props = { file: FileInfo; size?: LabelSize };

export default function DiagramReviewStatus({ file, size }: Props) {
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
    <StyledLabel size={size} variant={fileStatus.variant}>
      {fileStatus.label}
    </StyledLabel>
  );
}
