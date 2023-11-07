/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, type PropsWithChildren, type ReactNode } from 'react';
import styled from 'styled-components';

export const WidgetBody = ({ children }: PropsWithChildren): ReactElement => {
  const renderContent = (): ReactNode => {
    return children;
  };

  return <Container>{renderContent()}</Container>;
};

const Container = styled.div`
  height: 100%;
  overflow: auto;
`;
