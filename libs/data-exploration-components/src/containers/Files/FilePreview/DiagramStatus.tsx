import React, { useState, useEffect } from 'react';

import { Chip, ChipType, ChipProps } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { TFunction, useTranslation } from '@data-exploration-lib/core';

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

export const getApprovalDetails = (
  t: TFunction
): { [key: string]: ReviewStatus } => {
  return {
    pending: {
      status: PENDING_LABEL.externalId,
      variant: 'warning',
      label: t('PENDING_APPROVAL', 'Pending approval'),
      tooltip: t(
        'NEW_TAGS_NEED_REVIEW',
        'New detected tags that need to be reviewed'
      ),
    },
    approved: {
      status: INTERACTIVE_LABEL.externalId,
      variant: 'success',
      label: t('APPROVED', 'Approved'),
      tooltip: t('ALL_TAGS_REVIEWED', 'All tags have been reviewed'),
    },
    unknown: {
      status: 'No tags detected',
      variant: 'default',
      label: t('NO_TAGS_DETECTED', 'No tags detected'),
      tooltip: t(
        'NO_TAGS_FOUND_IN_DIAGRAM',
        'No tags were found in the diagram'
      ),
    },
  };
};
export default function DiagramReviewStatus({ fileId }: Props) {
  const { t } = useTranslation();
  const approvalDetails = getApprovalDetails(t);

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
    <Chip
      size="small"
      type={fileStatus.variant}
      tooltipProps={{ content: fileStatus.tooltip }}
      {...chipProps}
    />
  );
}
