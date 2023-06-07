import React from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { getUrlWithQueryParams } from 'utils/config';

type Props = {
  to?: string;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
};

/*
 * Link that keeps the search state in the url.
 */
export function Link(props: Props) {
  const { href, children, to, onClick } = props;
  const pathname = to ? getUrlWithQueryParams(to) : undefined;

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
      >
        {children}
      </a>
    );
  }
  return (
    <ReactRouterLink to={{ pathname }} onClick={onClick}>
      {children}
    </ReactRouterLink>
  );
}
