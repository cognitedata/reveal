import React, { PropsWithChildren } from 'react';

import styled, { css } from 'styled-components';

import { useExpandedIdParams } from '../../../hooks/useParams';

export const PageWidgets: React.FC<PropsWithChildren> = ({ children }) => {
  const [expandedId, setExpandedId] = useExpandedIdParams();

  const onExpandClick = React.useCallback(
    (id: string | undefined) => {
      setExpandedId(id);
    },
    [setExpandedId]
  );

  return (
    <Content>
      <Container hasExpandedWidget={!!expandedId}>
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
      </Container>
    </Content>
  );
};

const Container = styled.div<{ hasExpandedWidget: boolean }>`
  gap: 10px;
  padding: 16px 0;

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
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-auto-rows: minmax(310px, auto);
        grid-template-rows: 310px;
      `;
    }
  }}
`;

const Content = styled.div`
  display: flex;
  justify-content: center;
`;
