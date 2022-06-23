import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { openExternalPage } from 'utils/openExternalPage';

import { Button, Tooltip } from '@cognite/cogs.js';

import { useTranslation } from 'hooks/useTranslation';

import { UrlContainer, UrlLinkActions, UrlLinkText } from '../elements';

export const UrlPath: React.FC<{ url: string }> = ({ url }) => {
  const { t } = useTranslation('Documents');

  return (
    <UrlContainer>
      <UrlLinkText>{url}</UrlLinkText>

      <UrlLinkActions>
        <Tooltip content={t('Open url in a new tab')}>
          <Button
            aria-label="Navigate to external url"
            icon="ExternalLink"
            size="small"
            type="ghost"
            data-testid="document-url-external-link-icon"
            onClick={() => openExternalPage(url)}
          />
        </Tooltip>

        <Tooltip content="Copy to clipboard">
          <CopyToClipboard text={url}>
            <Button
              aria-label="Copy path"
              icon="Copy"
              size="small"
              type="ghost"
              data-testid="document-url-copy-icon"
            />
          </CopyToClipboard>
        </Tooltip>
      </UrlLinkActions>
    </UrlContainer>
  );
};
