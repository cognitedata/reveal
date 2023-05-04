import React from 'react';
import { PropsWithChildren } from 'react';
import styled, { css } from 'styled-components';
import { useExpandedIdParams } from '../../../hooks/useParams';

export const PageDashboard: React.FC<PropsWithChildren> = ({ children }) => {
  const [expandedId, setExpandedId] = useExpandedIdParams();

  const onExpandClick = React.useCallback(
    (id: string | undefined) => {
      setExpandedId(id);
    },
    [setExpandedId]
  );

  return (
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
  );
};

const Container = styled.div<{ hasExpandedWidget: boolean }>`
  display: grid;
  gap: 10px;
  padding: 24px 0;

  ${({ hasExpandedWidget }) => {
    if (hasExpandedWidget) {
      return css`
        grid-template-columns: repeat(1, 1fr);
        grid-auto-rows: 100%;
      `;
    } else {
      return css`
        grid-template-columns: repeat(2, 1fr);
        grid-auto-rows: minmax(310px, auto);
        grid-template-rows: 310px;
      `;
    }
  }}
`;
