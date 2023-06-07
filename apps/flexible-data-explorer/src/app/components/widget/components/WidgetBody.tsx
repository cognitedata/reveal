import { PropsWithChildren } from 'react';

import styled, { css } from 'styled-components';

import { BaseWidgetProps } from '../Widget';

export const WidgetBody = ({
  children,
  state,
  fullWidth,
}: PropsWithChildren<Pick<BaseWidgetProps, 'state' | 'fullWidth'>>) => {
  const renderContent = () => {
    if (state === 'loading') {
      return <p>Loading...</p>;
    }
    return children;
  };

  return <Container fullWidth={fullWidth}>{renderContent()}</Container>;
};

const Container = styled.div<Pick<BaseWidgetProps, 'fullWidth'>>`
  padding: 16px;
  height: 100%;
  overflow: auto;

  ${(props) => {
    if (props.fullWidth) {
      return css`
        padding: 0;
      `;
    }
  }}
`;
