import React, { FunctionComponent } from 'react';

import { ExternalLink } from '@extraction-pipelines/components/links/ExternalLink';
import { trackUsage } from '@extraction-pipelines/utils/Metrics';

import { createLink } from '@cognite/cdf-utilities';

interface LinkBase {
  linkText: string;
}

interface WithUrl {
  url: string;
  path?: never;
}
interface WithPath {
  url?: never;
  path: string;
}
type Link = WithUrl | WithPath;

interface OwnProps extends LinkBase {
  link: Link;
}

const ExtractorDownloadsLink: FunctionComponent<OwnProps> = ({
  linkText,
  link: { url, path },
}: OwnProps) => {
  const displayHref = url || createLink(path || '');

  const onLinkClick = () => {
    trackUsage({ t: 'Navigation', href: displayHref });
  };
  return (
    <>
      {(url || path) && (
        <ExternalLink href={displayHref} onClick={onLinkClick}>
          {linkText}
        </ExternalLink>
      )}
    </>
  );
};

export default ExtractorDownloadsLink;
