import { PropsWithChildren } from 'react';

import styled, { css } from 'styled-components';

import { WidgetBody } from './components/WidgetBody';
import { WidgetHeader } from './components/WidgetHeader';

export interface BaseWidgetProps {
  id?: string;
  state?: 'loading' | 'error' | 'success' | 'empty';
  // TODO: Why do we have 'isExpanded' and 'expanded'?
  isExpanded?: boolean;
  expanded?: boolean; // FIX_ME: make this nicer...
  onExpandClick?: (id: string | undefined) => void;
  // make widget to take full available width (i.e. for file preview)
  fullWidth?: boolean;

  /** Number of columns that the widgets spans */
  columns?: 1 | 2 | 3 | 4;

  /** Number of rows that the widgets spans */
  rows?: number;

  noPadding?: boolean;
}

export const Widget = ({
  children,
  id,
  expanded,
  fullWidth,
  columns,
  rows,
}: PropsWithChildren<BaseWidgetProps>) => {
  return (
    <Container
      rows={rows}
      columns={columns}
      expanded={expanded}
      id={id}
      fullWidth={fullWidth}
    >
      {children}
    </Container>
  );
};

Widget.Header = WidgetHeader;
Widget.Body = WidgetBody;

const Container = styled.div<BaseWidgetProps>`
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  background-color: white;
  box-shadow: 0px 1px 1px 1px rgba(79, 82, 104, 0.06),
    0px 1px 2px 1px rgba(79, 82, 104, 0.04);

  ${(props) => {
    if (props.fullWidth) {
      return css`
        max-width: unset;
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 0;
        box-shadow: none;
      `;
    }

    if (props.expanded) {
      return css`
        align-self: flex-start;
        max-width: 1024px;
        width: 100%;
        margin-top: 16px;
      `;
    }

    return css`
      grid-column: span ${props.columns || 1};
      grid-row: span ${props.rows || 1};
      width: 100%;
    `;
  }};
`;
