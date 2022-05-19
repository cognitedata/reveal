import { AnnotationStatus } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { KeypointCollection, Shape, Tool } from 'src/modules/Review/types';
import { ReviewImageKeypoint } from 'src/modules/Review/store/review/types';

export type KeypointCollectionState = {
  id: string;
  keypointIds: string[];
  label: string;
  show: boolean;
  status: AnnotationStatus;
  // do we have to have selected state here?
};

type PredefinedAnnotations = {
  predefinedKeypointCollections: KeypointCollection[];
  predefinedShapes: Shape[];
};

export type AnnotatorWrapperState = {
  predefinedAnnotations: PredefinedAnnotations;
  keypointMap: {
    byId: Record<string, ReviewImageKeypoint>;
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
