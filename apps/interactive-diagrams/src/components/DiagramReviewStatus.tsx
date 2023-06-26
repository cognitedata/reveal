import React, { useState, useEffect } from 'react';

import { Tooltip } from 'antd';

import { Chip, ChipProps } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { isFileApproved, isFilePending } from '../hooks';

import { ReviewStatus, approvalDetails } from './Filters';

type Props = { fileId: number; size?: ChipProps['size'] };

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
      <Chip
        css={{
          'white-space': 'nowrap',
        }}
        hideTooltip
        icon={!isFetched ? 'Loader' : undefined}
        label={fileStatus.label}
        size={size}
        type={fileStatus.variant}
      />
    </Tooltip>
  );
}
