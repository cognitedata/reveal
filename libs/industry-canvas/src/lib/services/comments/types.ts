import { UserProfile } from '../../UserProfileProvider';

export enum CommentStatus {
  DRAFT = 'Draft',
  ASSIGNED = 'Assigned',
  RESOLVED = 'Resolved',
}

export enum CommentTargetType {
  CANVAS = 'canvas',
}

// TODO: What entries should this enum have?
export enum CommentContextType {
  FOO = 'foo',
}

export type Comment<CommentContextDataType = any> = {
  text: string;
  createdById: string;
  status?: CommentStatus;
  parentComment?: Pick<Comment, 'externalId'>;

  targetId?: string;
  targetType?: CommentTargetType;
  contextId?: string;
  contextType?: CommentContextType;
  contextData?: CommentContextDataType;

  taggedUsers?: string[];

  externalId: string;
  lastUpdatedTime: Date;
  createdTime: Date;
};

export type CommentWithUserProfile<CommentContextDataType = any> = Omit<
  Comment<CommentContextDataType>,
  'createdById' | 'taggedUsers'
> & {
  // It might be that, for a given user identifier, the corresponding user
  // profile may not exist. This is why we have the `undefined` in the type,
  // so that the application may handle this edge case themselves
  createdBy: UserProfile | undefined;
  taggedUsers?: (UserProfile | undefined)[];
};

export type CommentFilter = Partial<
  Pick<
    Comment,
    | 'externalId'
    | 'createdById'
    | 'status'
    | 'parentComment'
    | 'targetId'
    | 'targetType'
    | 'contextId'
    | 'contextType'
    | 'taggedUsers'
  >
>;
