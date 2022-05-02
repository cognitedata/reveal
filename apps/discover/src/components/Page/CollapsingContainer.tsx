import * as React from 'react';

import styled, { css } from 'styled-components/macro';
import scrollHandler from 'utils/scrollHandler';
import layers from 'utils/zindex';

const Container = styled.div`
  position: sticky;
  width: 100%;
  background: var(--cogs-white);
  z-index: ${layers.TOP_BAR};
  transition: transform 0.25s;

  ${(props: { expanded: boolean }) =>
    !props.expanded &&
    css`
      transform: translateY(-100%);
    `}

  ${(props: { static: boolean }) =>
    props.static
      ? css`
          position: unset;
          transition: none;
        `
      : css`
          position: sticky;
          top: 0;
        `}
`;

export const CollapsingContainer = (props: { children: React.ReactNode }) => {
  const [expanded, setExpanded] = React.useState<boolean>(true);
  const [staticPos, setStaticPos] = React.useState<boolean>(true);

  React.useEffect(() => {
    const scrollEl = document.getElementById('page-wrapper');
    const scrollEventListener = (e: unknown) =>
      scrollHandler(e as React.UIEvent<HTMLElement>, setExpanded, setStaticPos);

    scrollEl?.addEventListener('scroll', scrollEventListener);

    return () => {
      scrollEl?.removeEventListener('scroll', scrollEventListener);
    };
  }, []);

  return (
    <Container expanded={expanded} static={staticPos}>
      {props.children}
    </Container>
  );
};
