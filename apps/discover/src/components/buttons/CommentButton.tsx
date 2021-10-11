import { BaseButton } from './BaseButton';
import { ExtendedButtonProps } from './types';

export const CommentButton: React.FC<ExtendedButtonProps> = ({ ...props }) => {
  return (
    <BaseButton
      icon="Comment"
      size="small"
      tooltip="Open comments"
      aria-label="Comment"
      {...props}
    />
  );
};
