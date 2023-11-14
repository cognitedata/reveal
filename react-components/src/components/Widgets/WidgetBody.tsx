/*!
 * Copyright 2023 Cognite AS
 */
import { type PropsWithChildren, type ReactNode, type ReactElement } from 'react';
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
