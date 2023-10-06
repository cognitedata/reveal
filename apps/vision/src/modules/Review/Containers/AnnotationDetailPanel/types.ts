import React, { ReactText } from 'react';
import { FixedSizeNodeData } from 'react-vtree';

import { FileInfo } from '@cognite/sdk';

import {
  CDFAnnotationTypeEnum,
  Status,
} from '../../../../api/annotation/types';
import { VisionAnnotationDataType } from '../../../Common/types';
import {
  PredefinedKeypoint,
  ReviewKeypoint,
  Selectable,
  TempKeypointCollection,
  VisionReviewAnnotation,
} from '../../types';

export type AnnotationDetailPanelAnnotationType = Selectable & {
  title: string;
  emptyPlaceholder: string;
};

export type AnnotationDetailPanelCommonProps = {
  file: FileInfo;
  reviewAnnotations: VisionReviewAnnotation<VisionAnnotationDataType>[];
  annotationType: CDFAnnotationTypeEnum;
  component: React.FunctionComponent<
    VirtualizedTreeRowProps<
      AnnotationDetailPanelRowDataBase<AnnotationDetailPanelRowData>
    >
  >;
  color?: string;
  index?: number;
  tempKeypointCollection: TempKeypointCollection | null;
};

export type AnnotationDetailPanelReviewCallbacks = {
  onSelect: (id: ReactText, state: boolean) => void;
  onDelete: (id: number) => void;
  onVisibilityChange: (id: number) => void;
  onApproveStateChange: (id: number, status: Status) => void;
  onKeypointSelect?: (id: string) => void;
};

export type AnnotationDetailPanelRowDataBase<RowDataType> = {
  common: AnnotationDetailPanelCommonProps;
  callbacks: AnnotationDetailPanelReviewCallbacks;
} & RowDataType;

/**
 * Contains data related to different row classes/data types in annotation detail panel.
 * A row can be:
 *  - An annotation type header, e.g. Linked assets, objects or keypoint collections
 *  - An annotation instance, represented as `VisionReviewAnnotation`, e.g. an `ImageObjectDetection` instance
 *  - A keypoint instance within a keypoint collection, represented as `ReviewKeypoint`
 */
export type AnnotationDetailPanelRowData = AnnotationDetailPanelRowDataBase<
  | AnnotationDetailPanelAnnotationType
  | VisionReviewAnnotation<VisionAnnotationDataType>
  | ReviewKeypoint
  | PredefinedKeypoint
>;

// Tree Node Types
export type TreeNode<T> = Readonly<{
  children: TreeNode<T>[];
  id: string;
  name: string;
  component: React.FC<VirtualizedTreeRowProps<T>>;
  openByDefault: boolean;
  additionalData: T;
}>;

export type TreeData<T> = FixedSizeNodeData &
  Readonly<{
    isLeaf: boolean;
    name: string;
    nestingLevel: number;
    node: TreeNode<T>;
  }>;

export type NodeMeta<T> = Readonly<{
  nestingLevel: number;
  node: TreeNode<T>;
}>;

export type VirtualizedTreeRowProps<T> = {
  id: string;
  name: string;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  isLeaf: boolean;
  nestingLevel: number;
  childItems: TreeNode<T>[];
  additionalData: T;
} & { showEditOptions: boolean };
