export type ReviewState = {
  fileIds: number[];
  selectedAnnotationIds: number[];
  hiddenAnnotationIds: number[];
  annotationSettings: {
    show: boolean;
    activeView: 'keypoint' | 'shape';
    createNew: {
      text?: string;
      color?: string;
    };
  };
  scrollToId: string;
};
