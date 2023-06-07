import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Icon, Label, LabelSize } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { ReviewStatus, approvalDetails } from 'components/Filters';
import { isFileApproved, isFilePending } from 'hooks';
import { Tooltip } from 'antd';

const StyledLabel = styled(Label)`
  white-space: nowrap;
`;

type Props = { fileId: number; size?: LabelSize };

export default function DiagramReviewStatus({ fileId, size }: Props) {
  const [fileStatus, setFileStatus] = useState<ReviewStatus>(
    approvalDetails.unknown
  );

  const {
    data: file,
    isFetched,
    error,
  } = useCdfItem<FileInfo>('files', {
    id: fileId,
  });

  useEffect(() => {
    if (!file) return;
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
      <StyledLabel size={size} variant={fileStatus.variant}>
        {isFetched ? fileStatus.label : <Icon type="Loader" />}
      </StyledLabel>
    </Tooltip>
  );
}
