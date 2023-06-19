import React from 'react';

import styled from 'styled-components';

import { Body, Colors, Flex, Icon, Tooltip } from '@cognite/cogs.js';

type FormFieldProps = {
  children: React.ReactNode;
  info?: string;
  isRequired?: boolean;
  title: string;
};

export const FormField = ({
  children,
  info,
  isRequired,
  title,
}: FormFieldProps): JSX.Element => {
  return (
    <Flex direction="column" gap={4}>
      <Flex alignItems="center" gap={8}>
        <Body level={2} strong>
          {title}
        </Body>
        {isRequired && <RequiredSign>*</RequiredSign>}
        {info && (
          <Tooltip content={info} delay={300} placement="right" wrapped>
            <Flex alignItems="center">
              <InfoIcon type="InfoFilled" />
            </Flex>
          </Tooltip>
        )}
      </Flex>
      {children}
    </Flex>
  );
};

const RequiredSign = styled.span`
  color: ${Colors['text-icon--status-critical']};
`;

const InfoIcon = styled(Icon)`
  color: ${Colors['text-icon--status-undefined']};
`;
