import { AnnotationCollection } from 'src/modules/Review/types';

export type AnnotationWrapperState = {
  predefinedAnnotations: AnnotationCollection;
  // keypointMap: {
  //   byId: Record<string, KeyPointState>;
  //   allIds: string[];
  //   selectedIds: string[];
  // };
  // collections: {
  //   byId: Record<string, KeypointCollectionState>;
  //   allIds: string[];
  //   selectedIds: string[];
  // };
  // lastCollectionId: string | undefined;
  // lastCollectionName: string | undefined;
  // lastShape: string | undefined;
  // lastKeyPoint: string | undefined;
  // currentTool: Tool;
  // keepUnsavedRegion: boolean;
};
