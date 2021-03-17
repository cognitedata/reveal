import { Icon } from '@cognite/cogs.js';
import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { trackUsage } from 'utils/Metrics';
import { NAVIGATION } from 'utils/constants';
import { useAppEnv } from 'hooks/useAppEnv';

const LinkIcon = styled((props) => <Icon {...props}>{props.children}</Icon>)`
  margin-left: 0.5rem;
  width: 0.8rem;
`;
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
  const { project, cdfEnv } = useAppEnv();
  const displayHref =
    url || `/${project}${path}${cdfEnv ? `?env=${cdfEnv}` : ''}`;
  const onLinkClick = () => {
    trackUsage(NAVIGATION, { href: displayHref });
  };
  return (
    <>
      {(url || path) && (
        <a
          href={displayHref}
          className="cogs-btn cogs-btn-link"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onLinkClick}
        >
          {linkText}
          <LinkIcon type="ExternalLink" />
        </a>
      )}
    </>
  );
};

export default ExtractorDownloadsLink;
