import { BaseButton } from './BaseButton';
import { DOWNLOAD_BUTTON_TOOLTIP } from './constants';
import { ExtendedButtonProps } from './types';

export const DownloadButton: React.FC<ExtendedButtonProps> = ({ ...props }) => (
  <BaseButton
    icon="Download"
    tooltip={DOWNLOAD_BUTTON_TOOLTIP}
    aria-label="Download"
    {...props}
  />
);
