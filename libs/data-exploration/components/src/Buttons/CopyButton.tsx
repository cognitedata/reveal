import { ButtonProps } from '@cognite/cogs.js';

import { BaseButton } from './BaseButton';

type Props = ButtonProps & {
  hasCopied: boolean;
};

export const CopyButton: React.FC<Props> = ({ hasCopied, ...props }: Props) => {
  return (
    <BaseButton
      {...props}
      type="ghost"
      size="small"
      icon={hasCopied ? 'Checkmark' : 'Copy'}
      disabled={hasCopied}
      aria-label="Copy"
    />
  );
};
