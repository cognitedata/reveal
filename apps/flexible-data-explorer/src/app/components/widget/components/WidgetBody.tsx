import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { BaseWidgetProps } from '../Widget';

export const WidgetBody = ({
  children,
  state,
}: PropsWithChildren<{ state?: BaseWidgetProps['state'] }>) => {
  const renderContent = () => {
    if (state === 'loading') {
      return <p>Loading...</p>;
    }
    return children;
  };

  return <Container>{renderContent()}</Container>;
};

const Container = styled.div`
  padding: 16px;
  height: 100%;
  overflow: auto;
`;
