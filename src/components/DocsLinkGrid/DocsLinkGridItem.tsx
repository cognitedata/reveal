import { PropsWithChildren } from 'react';
import { Button, Colors, Icon, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

export type DocsLinkGridItemProps = {
  href: string;
  onClick?: () => void;
};

const DocsLinkGridItem = styled(
  (props: PropsWithChildren<DocsLinkGridItemProps>) => (
    <Button type="secondary" target="_blank" {...props}>
      <Title level="5">{props.children}</Title>
      <Icon type="ExternalLink" />
    </Button>
  )
)`
  & > span {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  background-color: ${Colors['decorative--grayscale--200']};
  border-radius: 6px;

  && {
    height: auto;
    padding: 26px 24px;
    color: ${Colors['text-icon--medium']};

    &:hover {
      background-color: ${Colors['surface--strong']};

      > * {
        color: ${Colors['surface--action--strong--default']};
      }
    }
  }

  > * {
    color: ${Colors['text-icon--medium']};
  }

  svg {
    color: inherit;
  }
`;

export default DocsLinkGridItem;
