import React from 'react';
import { Label, LabelVariants } from '@cognite/cogs.js';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';
type ApprovalDetails = {
  status: ApprovalStatus;
  variant: LabelVariants;
  label: string;
};
// type Props = { workflowId: number; fileId: number };

export default function ColumnApproval() {
  const approvalDetails: ApprovalDetails[] = [
    { status: 'pending', variant: 'warning', label: 'Pending approval' },
    { status: 'approved', variant: 'success', label: 'Approved' },
    { status: 'rejected', variant: 'unknown', label: 'Rejected' },
  ];

  // [todo] this is a mock
  const randomFileStatus =
    approvalDetails[Math.floor(Math.random() * 2)].status;
  const fileApprovalStatus = approvalDetails.find(
    (details) => details.status === randomFileStatus
  );

  if (fileApprovalStatus)
    return (
      <Label size="small" variant={fileApprovalStatus.variant}>
        {fileApprovalStatus.label}
      </Label>
    );
  return <span>N/A</span>;
}
