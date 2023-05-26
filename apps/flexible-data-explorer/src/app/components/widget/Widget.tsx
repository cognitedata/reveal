import { PropsWithChildren } from 'react';

import styled, { css } from 'styled-components';

import { WidgetBody } from './components/WidgetBody';
import { WidgetHeader } from './components/WidgetHeader';

export interface BaseWidgetProps {
  id?: string;
  state?: 'loading' | 'error';
  isExpanded?: boolean;
  onExpandClick?: (id: string | undefined) => void;
  expanded?: boolean; // FIX_ME: make this nicer...

  /** Number of columns that the widgets spans */
  columns?: 1 | 2;

  /** Number of rows that the widgets spans */
  rows?: number;
}

export const Widget = ({
  children,
  id,
  expanded,
  columns,
  rows,
}: PropsWithChildren<BaseWidgetProps>) => {
  return (
    <Container rows={rows} columns={columns} expanded={expanded} id={id}>
      {children}
    </Container>
  );
};

Widget.Header = WidgetHeader;
Widget.Body = WidgetBody;

const Container = styled.div<BaseWidgetProps>`
  ${(props) => {
    if (props.expanded) {
      return css`
        align-self: center;
        width: 1024px;
      `;
    }

    return css`
      grid-column: span ${props.columns || 1};
      grid-row: span ${props.rows || 1};
      width: 100%;
    `;
  }}

  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  background-color: white;
  box-shadow: 0px 1px 16px 4px rgba(79, 82, 104, 0.1),
    0px 1px 8px rgba(79, 82, 104, 0.08), 0px 1px 2px rgba(79, 82, 104, 0.24);
`;
