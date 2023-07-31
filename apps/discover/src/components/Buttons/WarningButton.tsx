import { BaseButton } from './BaseButton';
import { ExtendedButtonProps } from './types';

export const WarningButton: React.FC<ExtendedButtonProps> = (props) => (
  <BaseButton icon="Warning" aria-label="Warning" {...props} />
);
