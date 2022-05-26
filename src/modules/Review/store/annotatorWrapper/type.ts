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
  lastCollectionName: string | undefined; // Caption (label) of last used Predefined Annotations collection, use to select for the next time
  lastShape: string | undefined; // shapeName (label) of last used predefined shapes, use to select for the next time
  lastKeyPoint: string | undefined; // label of last created keypoint to get next keypoint
  currentTool: Tool;
  keepUnsavedRegion: boolean;
};
