import { BaseButton } from './BaseButton';
import { PREVIEW_BUTTON_TEXT } from './constants';
import { ExtendedButtonProps } from './types';

export const PreviewButton: React.FC<ExtendedButtonProps> = ({ ...props }) => (
  <BaseButton
    size="small"
    type="secondary"
    text={PREVIEW_BUTTON_TEXT}
    aria-label="Preview"
    {...props}
  />
);
