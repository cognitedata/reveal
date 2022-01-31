import { VisionFile } from 'src/modules/Common/store/files/types';

export type ModelTrainingModalContentProps = {
  selectedFiles: VisionFile[];
  onCancel: () => void;
};
