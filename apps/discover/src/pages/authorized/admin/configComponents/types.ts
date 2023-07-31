import { CustomComponentProps } from '../projectConfig';

export type FormModalProps = Pick<
  CustomComponentProps,
  'onClose' | 'metadataValue' | 'value' | 'mode'
> & {
  onOk: (datum: Record<string, unknown>) => void;
};
