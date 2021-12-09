export type LineReviewStatus = 'OPEN' | 'REVIEW' | 'IGNORED' | 'RESOLVED';
export type LineReviewAnnotationStatus = 'UNCHECKED' | 'CHECKED';
export type DateTime = number;
export type Assignee = {
  name: string;
};
export type Comment = {
  text: string;
  user: {
    name: string;
  };
};
export type LineReviewAnnotation = {
  min: [number, number];
  max: [number, number];
  status: LineReviewAnnotationStatus;
  title: string;
  description: string;
  comments: Comment[];
};
export type LineReviewDocument = {
  fileExternalId: string;
  annotations: LineReviewAnnotation[];
};
export type LineReview = {
  id: string;
  name: string;
  status: LineReviewStatus;
  description: string;
  updatedAt?: DateTime;
  createdOn: DateTime;
  assignees: Assignee[];
  documents: LineReviewDocument[];
  markup: any[];
  comments: Comment[];
};
