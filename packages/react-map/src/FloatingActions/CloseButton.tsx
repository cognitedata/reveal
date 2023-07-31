import { BaseButtonProps, BaseButton } from './BaseButton';

export const CloseButton: React.FC<BaseButtonProps> = (props) => (
  <BaseButton icon="Close" tooltip="Close" aria-label="Close" {...props} />
);
