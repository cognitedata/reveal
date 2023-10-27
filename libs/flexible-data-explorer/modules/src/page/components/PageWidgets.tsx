import React, { PropsWithChildren } from 'react';

import styled, { css } from 'styled-components';

import { useExpandedIdParams } from '@fdx/shared/hooks/useParams';

export const PageWidgets: React.FC<PropsWithChildren> = ({ children }) => {
  const [expandedId, setExpandedId] = useExpandedIdParams();

  const onExpandClick = React.useCallback(
    (id: string | undefined) => {
      setExpandedId(id);
    },
    [setExpandedId]
  );

  return (
    <Container hasExpandedWidget={!!expandedId}>
      <Content hasExpandedWidget={!!expandedId}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            const id = child.props.id;

            if (!id) {
              return <p>Widget is missing an ID</p>;
            }

            if (expandedId !== undefined && expandedId !== id) {
              // Hide/remove widgets that are not expanded.
              // NOTE! "Possible" improvement: hide widgets with css.
              return null;
            }

            return React.cloneElement(child, {
              onExpandClick,
              isExpanded: expandedId === id,
            } as any);
          }

          return <>{child}</>;
        })}
      </Content>
    </Container>
  );
};

const Content = styled.div<{ hasExpandedWidget: boolean }>`
  gap: 20px;

  ${({ hasExpandedWidget }) => {
    if (hasExpandedWidget) {
      return css`
        display: flex;
        justify-content: center;
        width: 100%;
      `;
    } else {
      return css`
        width: 1024px;
        max-width: 1024px;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        padding: 16px 0;
        /* The height of the grid items is derived on the bases of the properties widget. Avoid changing the value here. */
        grid-auto-rows: 65px;
      `;
    }
  }};
`;

const Container = styled.div<{ hasExpandedWidget: boolean }>`
  display: flex;
  justify-content: center;

  ${({ hasExpandedWidget }) => {
    if (hasExpandedWidget) {
      return css`
        height: 100%;
      `;
    }
  }};
`;
