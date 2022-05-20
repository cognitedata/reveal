import { KeypointCollection, Shape, Tool } from 'src/modules/Review/types';
import { ImageKeypoint, Status } from 'src/api/annotation/types';

export type KeypointCollectionState = {
  id: string;
  keypointIds: string[];
  label: string;
  show: boolean;
  status: Status;
  // do we have to have selected state here?
};

type PredefinedAnnotations = {
  predefinedKeypointCollections: KeypointCollection[];
  predefinedShapes: Shape[];
};

export type AnnotatorWrapperState = {
  predefinedAnnotations: PredefinedAnnotations;
  keypointMap: {
    byId: Record<string, ImageKeypoint>;
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
