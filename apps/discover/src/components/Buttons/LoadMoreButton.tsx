import { BaseButton } from './BaseButton';
import { LOAD_MORE_BUTTON_TEXT } from './constants';
import { ExtendedButtonProps } from './types';

export const LoadMoreButton: React.FC<ExtendedButtonProps> = ({ ...props }) => (
  <BaseButton
    block={false}
    type="tertiary"
    icon="ArrowDown"
    text={LOAD_MORE_BUTTON_TEXT}
    aria-label="Load more"
    {...props}
  />
);
