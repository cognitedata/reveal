import styled from 'styled-components';

import { Body, Heading, Illustrations } from '@cognite/cogs.js';

type NoResultsProps = {
  action?: React.ReactNode;
  bodyText: string;
  headerText: string;
};

export const NoResults = ({
  action,
  bodyText,
  headerText,
  ...rest
}: NoResultsProps) => {
  return (
    <Wrapper {...rest}>
      <Illustrations.Solo
        css={{ marginBottom: '20px' }}
        type="EmptyStateSearch"
      />

      <Heading css={{ marginBottom: '8px' }} level={5}>
        {headerText}
      </Heading>
      <Body size="medium">{bodyText}</Body>
      {action && <div style={{ marginTop: '24px' }}>{action}</div>}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  justify-content: center;
  text-align: center;
`;
