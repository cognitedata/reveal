import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { WidgetBody } from './components/WidgetBody';
import { WidgetHeader } from './components/WidgetHeader';

export interface BaseWidgetProps {
  id: string;
  state?: 'loading' | 'error';
  isExpanded?: boolean;
  onExpandClick?: (id: string | undefined) => void;
}

export const Widget = ({
  children,
  id,
}: PropsWithChildren<BaseWidgetProps>) => {
  return <Container id={id}>{children}</Container>;
};

Widget.Header = WidgetHeader;
Widget.Body = WidgetBody;

const Container = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  background-color: white;
  box-shadow: 0px 1px 16px 4px rgba(79, 82, 104, 0.1),
    0px 1px 8px rgba(79, 82, 104, 0.08), 0px 1px 2px rgba(79, 82, 104, 0.24);
`;
