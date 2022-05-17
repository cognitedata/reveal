import { AnnotationStatus } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { AnnotationCollection, Tool } from 'src/modules/Review/types';

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

export type AnnotatorState = {
  predefinedAnnotations: AnnotationCollection;
  keypointMap: {
    byId: Record<string, KeyPointState>;
    allIds: string[];
    selectedIds: string[];
  };
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
  keepUnsavedRegion: boolean;
};
