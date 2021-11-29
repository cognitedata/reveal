import React, { PropsWithChildren } from 'react';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

const LinkIcon = styled((props) => (
  <Icon {...props} size={12}>
    {props.children}
  </Icon>
))`
  margin-left: 0.3rem;
`;
type Props = {
  href: string;
  onClick?: () => void;
};
export const ExternalLink = ({
  children,
  href,
  ...rest
}: PropsWithChildren<Props>) => (
  <a
    href={href}
    className="cogs-btn cogs-btn-link"
    target="_blank"
    rel="noopener noreferrer"
    {...rest}
  >
    {children}
    <LinkIcon type="ExternalLink" />
  </a>
);
