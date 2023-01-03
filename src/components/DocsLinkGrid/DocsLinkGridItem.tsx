import { PropsWithChildren } from 'react';
import { Button, Colors, Title, Link } from '@cognite/cogs.js';
import styled from 'styled-components';

export type DocsLinkGridItemProps = {
  href: string;
  onClick?: () => void;
};

const DocsLinkGridItem = styled(
  (props: PropsWithChildren<DocsLinkGridItemProps>) => (
    <Button {...props}>
      <StyledLink target="_blank" href={props.href}>
        <Title level="5">{props.children}</Title>
      </StyledLink>
    </Button>
  )
)`
  background-color: ${Colors['decorative--grayscale--200']};
  border-radius: 6px;

  && {
    color: ${Colors['text-icon--medium']};

    &:hover {
      background-color: ${Colors['surface--strong']};

      > * {
        color: ${Colors['surface--action--strong--default']};
      }
    }
  }
`;

const StyledLink = styled(Link)`
  width: 100%;
  padding: 26px 24px;

  && {
    color: ${Colors['text-icon--medium']};

    &:hover {
      background-color: ${Colors['surface--strong']};

      > * {
        color: ${Colors['surface--action--strong--default']};
      }
    }
  }
`;

export default DocsLinkGridItem;
