import React from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';

/*
 * Link that keeps the search state in the url.
 */
export default function Link(props: {
  to?: string;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  if (props.href) {
    return (
      <a
        href={props.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={props.onClick}
      >
        {props.children}
      </a>
    );
  }
  return (
    <ReactRouterLink to={{ pathname: props.to }} onClick={props.onClick}>
      {props.children}
    </ReactRouterLink>
  );
}
