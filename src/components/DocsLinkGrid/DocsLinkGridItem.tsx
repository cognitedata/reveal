import { PropsWithChildren } from 'react';
import { Button, Colors, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

export type DocsLinkGridItemProps = {
  href: string;
  onClick?: () => void;
};

const DocsLinkGridItem = styled(
  (props: PropsWithChildren<DocsLinkGridItemProps>) => (
    <a target="_blank" href={props.href}>
      <StyledButton {...props}>
        <span>{props.children}</span>
        <Icon type="ExternalLink" />
      </StyledButton>
    </a>
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

const StyledButton = styled(Button)`
  && {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 24px;
  }
`;

export default DocsLinkGridItem;
