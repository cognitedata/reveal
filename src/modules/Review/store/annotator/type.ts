import { AnnotationStatus } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { KeypointCollection, Shape, Tool } from 'src/modules/Review/types';
import { ReviewKeypoint } from 'src/modules/Review/store/review/types';

export type KeypointCollectionState = {
  id: string;
  keypointIds: string[];
  label: string;
  show: boolean;
  status: AnnotationStatus;
};

type PredefinedAnnotations = {
  predefinedKeypointCollections: KeypointCollection[];
  predefinedShapes: Shape[];
};

export type AnnotatorState = {
  predefinedAnnotations: PredefinedAnnotations;
  keypointMap: {
    byId: Record<string, ReviewKeypoint>;
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
