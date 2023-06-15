import { TransformationRead } from '@transformations/types';

export type FieldSelectorProps = {
  transformation: TransformationRead;
  to: string;
  from: string;
  update: (from: string) => void;
  disabled?: boolean;
};
