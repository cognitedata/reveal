import { Annotation } from '.';

export type ScannerDetection = {
  id: string;
  key: string;
  valueAnnotation: Annotation & {
    value: string;
  };
};
