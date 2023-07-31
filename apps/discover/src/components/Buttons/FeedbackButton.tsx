import { BaseButton } from './BaseButton';
import { FEEDBACK_BUTTON_TOOLTIP } from './constants';
import { ExtendedButtonProps } from './types';

export const FeedbackButton: React.FC<ExtendedButtonProps> = ({ ...props }) => (
  <BaseButton
    icon="Comment"
    tooltip={FEEDBACK_BUTTON_TOOLTIP}
    aria-label="Feedback"
    {...props}
  />
);
