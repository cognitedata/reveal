import React, { ReactText } from 'react';
import { FixedSizeNodeData } from 'react-vtree';
import { VisibleAnnotation } from 'src/modules/Review/store/reviewSlice';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import {
  AnnotationStatus,
  KeypointVertex,
} from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { AnnotationTableItem } from 'src/modules/Review/types';
import { FileInfo } from '@cognite/sdk';

export type ReviewAnnotation = Omit<VisibleAnnotation, 'id'> & {
  id: string | number;
};

export type CommonProps = {
  file: FileInfo;
  annotations: ReviewAnnotation[];
  mode: VisionDetectionModelType;
  component: React.FunctionComponent<VirtualizedTreeRowProps<RowData<Data>>>;
};

export type Category = {
  title: string;
  selected: boolean;
  emptyPlaceholder: string;
};

export type AnnotationReviewCallbacks = {
  onSelect: (id: ReactText, state: boolean) => void;
  onDelete: (id: ReactText) => void;
  onVisibilityChange: (id: ReactText) => void;
  onApproveStateChange: (id: ReactText, status: AnnotationStatus) => void;
  onKeypointSelect?: (id: string) => void;
};

export type AnnotationReviewProps = AnnotationReviewCallbacks & {
  annotation: AnnotationTableItem;
  expandByDefault?: boolean;
};

export type RowData<TData> = {
  common: CommonProps;
  callbacks: AnnotationReviewCallbacks;
} & TData;

export type Data = RowData<Category | KeypointVertex | ReviewAnnotation>;

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
};
