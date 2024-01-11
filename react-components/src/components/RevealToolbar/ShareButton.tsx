/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { useTranslation } from '../i18n/I18n';
import { Button, Tooltip as CogsTooltip } from '@cognite/cogs.js';

export const ShareButton = (): ReactElement => {
  const { t } = useTranslation();

  const handleShare = async (): Promise<void> => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
  };

  return (
    <CogsTooltip
      content={t('COPY_URL_TO_SHARE', 'Copy URL to share')}
      placement="right"
      appendTo={document.body}>
      <Button icon="Share" type="ghost" aria-label="share-button" onClick={handleShare} />
    </CogsTooltip>
  );
};
