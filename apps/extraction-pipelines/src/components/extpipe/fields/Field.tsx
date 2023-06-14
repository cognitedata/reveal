import React from 'react';

import { TOOLTIP_DELAY_IN_MS } from '@cognite/cdf-utilities';
import { Body, Colors, Flex, Icon, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';

type FieldProps = {
  children: React.ReactNode;
  info?: string;
  isRequired?: boolean;
  title: string;
};

const Field = ({
  children,
  info,
  isRequired,
  title,
}: FieldProps): JSX.Element => {
  return (
    <Flex direction="column" gap={4}>
      <Flex alignItems="center" gap={4}>
        <Body level={2} strong>
          {title}
        </Body>
        {isRequired && <StyledRequiredSign>*</StyledRequiredSign>}
        {info && (
          <Tooltip
            content={info}
            delay={TOOLTIP_DELAY_IN_MS}
            placement="right"
            wrapped
          >
            <Flex alignItems="center">
              <StyledInfoIcon type="InfoFilled" />
            </Flex>
          </Tooltip>
        )}
      </Flex>
      {children}
    </Flex>
  );
};

const StyledRequiredSign = styled.span`
  color: ${Colors['text-icon--status-critical']};
`;

const StyledInfoIcon = styled(Icon)`
  color: ${Colors['text-icon--status-undefined']};
`;

export default Field;
