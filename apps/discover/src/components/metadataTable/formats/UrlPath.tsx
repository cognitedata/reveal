import React from 'react';
import { useTranslation } from 'react-i18next';

import { openExternalPage } from 'utils/url';

import { Icon, Tooltip } from '@cognite/cogs.js';

import { FlexGrow } from 'styles/layout';

import { UrlContainer, UrlLinkButton, UrlLinkText } from '../elements';

export const UrlPath: React.FC<{ url: string }> = ({ url }) => {
  const { t } = useTranslation('Documents');

  return (
    <UrlContainer>
      <UrlLinkButton onClick={() => openExternalPage(url)}>
        <UrlLinkText>{url}</UrlLinkText>
        <FlexGrow />
        <Tooltip content={t('Open url in a new tab')}>
          <Icon
            aria-label="Go to external url"
            type="ExternalLink"
            data-testid="document-url-external-link-icon"
          />
        </Tooltip>
      </UrlLinkButton>
    </UrlContainer>
  );
};
