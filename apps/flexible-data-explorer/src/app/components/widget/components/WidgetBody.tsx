import { PropsWithChildren } from 'react';

import styled, { css } from 'styled-components';

import { EmptyState } from '../../EmptyState';
import { BaseWidgetProps } from '../Widget';

export const WidgetBody = ({
  children,
  state,
  fullWidth,
  noPadding,
}: PropsWithChildren<
  Pick<BaseWidgetProps, 'state' | 'fullWidth' | 'noPadding'>
>) => {
  const renderContent = () => {
    if (state === 'empty') {
      return (
        <EmptyState
          title="No results"
          body="We couldn't find any results for your query"
        />
      );
    }

    if (state === 'loading') {
      return (
        <EmptyState
          title="Loading results"
          body="We are fetching your data. Hang on tight"
        />
      );
    }
    return children;
  };

  return (
    <Container noPadding={noPadding} fullWidth={fullWidth}>
      {renderContent()}
    </Container>
  );
};

const Container = styled.div<Pick<BaseWidgetProps, 'fullWidth' | 'noPadding'>>`
  padding: ${(props) => (props.noPadding ? '0' : '16px')};
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
