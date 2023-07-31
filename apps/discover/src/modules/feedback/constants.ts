export enum STATUS {
  New,
  Progress,
  Resolved,
  Dismissed,
}

export enum ASSESS {
  Approve,
  Reject,
}

export const FIELDS = {
  markedAs: { field: '_marked_as', display: 'Marked as' },
  status: { field: '_sort_status', display: 'Status' },
  assignedTo: { field: '_sort_assignedTo', display: 'Assigned to' },
  user: { field: '_sort_user', display: 'Submitted by' },
  date: { field: '_sort_timestamp', display: 'Created on' },
};

export const ASSESS_DROPDOWN_PLACEHOLDER = 'Assess';

export const ASSESS_DROPDOWN_APPROVE = 'Confirm as sensitive';
export const ASSESS_DROPDOWN_REJECT = 'Reject as sensitive';

export const ASSESS_DROPDOWN_APPROVED = 'Approved';
export const ASSESS_DROPDOWN_REJECTED = 'Rejected';

export const REASSESS_BUTTON_TEXT = 'Re-assess';

export const MODAL_APPROVE_TITLE = 'Confirm document as sensitive';
export const MODAL_APPROVE_BODY =
  'By approving this feedback you are keeping the document hidden from search. Are you sure you want to approve this document as sensitive?';
export const MODAL_APPROVE_BUTTON = 'Confirm and hide from Discover';

export const MODAL_REJECT_TITLE = 'Reject document as sensitive';
export const MODAL_REJECT_BODY =
  'By rejecting this feedback you are releasing the document to again be searched by users. Are you sure you want to reject this document as sensitive?';
export const MODAL_REJECT_BUTTON = 'Confirm and release to Discover';
