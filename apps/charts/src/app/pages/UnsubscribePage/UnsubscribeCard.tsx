import { ReactElement } from 'react';

import styled from 'styled-components';

import { Flex, Heading, Body } from '@cognite/cogs.js';

export const UnsubscribeCard = ({
  icon,
  title,
  subtitle,
  actions,
}: {
  icon: ReactElement;
  title: string;
  subtitle?: string;
  actions?: ReactElement;
}) => {
  return (
    <StyledFlex
      justifyContent="center"
      alignItems="center"
      direction="column"
      gap={12}
    >
      {icon}
      <Heading level={5}>{title}</Heading>
      {subtitle ? <Body size="x-small">{subtitle}</Body> : null}
      {actions ? (
        <Flex
          justifyContent="space-between"
          gap={16}
          style={{ marginTop: '16px' }}
        >
          {actions}
        </Flex>
      ) : null}
    </StyledFlex>
  );
};

const StyledFlex = styled(Flex)`
  padding: 32px 64px;
  background-color: white;
  border-radius: 16px;
  width: 670px;
  min-height: 350px;
  box-shadow: var(--cogs-elevation--surface--interactive);
`;
