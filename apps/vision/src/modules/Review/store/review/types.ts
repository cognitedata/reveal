import { AnnotationSettingsOption } from 'src/modules/Review/store/review/enums';

export type ReviewState = {
  fileIds: number[];
  selectedAnnotationIds: number[];
  hiddenAnnotationIds: number[];
  annotationSettings: {
    show: boolean;
    activeView: AnnotationSettingsOption;
    createNew: {
      text?: string;
      color?: string;
    };
  };
  scrollToId: string;
};
