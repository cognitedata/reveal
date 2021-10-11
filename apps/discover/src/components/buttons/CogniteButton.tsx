import { BaseButton } from './BaseButton';
import { ExtendedButtonProps } from './types';

export const CogniteButton: React.FC<ExtendedButtonProps> = ({ ...props }) => (
  <BaseButton icon="Cognite" {...props} aria-label="Cognite" />
);
