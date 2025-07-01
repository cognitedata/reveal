import React, { type ReactNode, type ForwardedRef, type ReactElement } from 'react';
import styled from 'styled-components';
import { WidgetHeader } from './WidgetHeader';

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
  height: 100%;
  min-width: 20%;
  min-height: 10%;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  background-color: white;
`;

type WidgetType = {
  Header: typeof WidgetHeader;
} & React.ForwardRefExoticComponent<
  React.PropsWithoutRef<WidgetProps> & React.RefAttributes<HTMLDivElement>
>;

const Widget = React.forwardRef(BaseWidget) as WidgetType;

Widget.Header = WidgetHeader;

export default Widget;
