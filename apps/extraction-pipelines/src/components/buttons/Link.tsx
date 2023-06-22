import React, { FunctionComponent, PropsWithChildren } from 'react';

interface LinkProps {
  href: string;
  linkText: string;
}

export const Link: FunctionComponent<LinkProps> = ({
  href,
  linkText,
}: PropsWithChildren<LinkProps>) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="cogs-btn cogs-btn-link"
    >
      {linkText}
    </a>
  );
};
