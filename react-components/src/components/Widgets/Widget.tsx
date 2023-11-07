/*!
 * Copyright 2023 Cognite AS
 */

import React, { type ReactElement, type ReactNode, type ForwardedRef } from 'react';
import styled from 'styled-components';
import { WidgetHeader } from './WidgetHeader';
import { WidgetBody } from './WidgetBody';

type WidgetProps = {
  children?: ReactNode;
  [x: string]: any;
};

const BaseWidget = (
  { children, ...props }: WidgetProps,
  ref: ForwardedRef<HTMLDivElement>
): ReactElement => {
  return (
    <Container ref={ref} {...props}>
      {children}
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  left: calc(40% - 20px);
  top: 50px;
  width: auto;
  height: auto;
  min-width: 60%;
  min-height: 10%;
  max-width: 60%;
  max-height: 80%;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  background-color: white;
  box-shadow:
    0px 1px 1px 1px rgba(79, 82, 104, 0.06),
    0px 1px 2px 1px rgba(79, 82, 104, 0.04);
`;

const Widget = React.forwardRef(BaseWidget) as any;

Widget.Header = WidgetHeader;
Widget.Body = WidgetBody;

export default Widget;
