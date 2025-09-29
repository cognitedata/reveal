import { type ReactElement } from 'react';
import { useTranslation } from '../i18n/I18n';
import { Button, Tooltip as CogsTooltip, ShareIcon } from '@cognite/cogs.js';

/**
 * @deprecated
 */
export const ShareButton = (): ReactElement => {
  const { t } = useTranslation();

  const handleShare = async (): Promise<void> => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
  };

  return (
    <CogsTooltip content={t({ key: 'COPY_URL_TO_SHARE' })} placement="right">
      <Button icon=<ShareIcon /> type="ghost" aria-label="share-button" onClick={handleShare} />
    </CogsTooltip>
  );
};
