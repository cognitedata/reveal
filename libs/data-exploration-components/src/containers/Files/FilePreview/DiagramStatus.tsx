import React, { useState, useEffect } from 'react';
import { FileInfo } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Icon, Chip, ChipType, ChipProps } from '@cognite/cogs.js';
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
  variant: keyof typeof ChipType;
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
    variant: 'default',
    label: 'No tags detected',
    tooltip: 'No tags were found in the diagram',
  },
};
export default function DiagramReviewStatus({ fileId }: Props) {
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

  const chipProps: Pick<ChipProps, 'label' | 'icon'> = isFetched
    ? { label: fileStatus.label }
    : { icon: 'Loader' };
  return (
    <Tooltip title={fileStatus.tooltip}>
      <Chip size="small" type={fileStatus.variant} {...chipProps} />
    </Tooltip>
  );
}
