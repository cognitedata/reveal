import { AnnotationStatus } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { LegacyAnnotationCollection, Tool } from 'src/modules/Review/types';

export type KeyPointState = {
  id: string;
  caption: string;
  order: string;
  color: string;
  defaultPosition?: [number, number];
};
type KeypointCollectionState = {
  id: string;
  keypointIds: string[];
  name: string;
  show: boolean;
  status: AnnotationStatus;
};

export type AnnotationLabelState = {
  predefinedAnnotations: LegacyAnnotationCollection;
  collections: {
    byId: Record<string, KeypointCollectionState>;
    allIds: string[];
    selectedIds: string[];
  };
  lastCollectionId: string | undefined;
  lastCollectionName: string | undefined;
  lastShape: string | undefined;
  lastKeyPoint: string | undefined;
  currentTool: Tool;
  keypointMap: {
    byId: Record<string, KeyPointState>;
    allIds: string[];
    selectedIds: string[];
  };
  keepUnsavedRegion: boolean;
};
