import React, { useCallback } from 'react';

import styled from 'styled-components';

import { Body, Colors, Flex, Heading } from '@cognite/cogs.js';

import { ExpandOptions } from './types';

export const Section = ({
  title,
  subtitle,
  expandOption,
  onClickExpand,
}: {
  title: string;
  subtitle: string;
  expandOption?: ExpandOptions;
  onClickExpand?: (option: ExpandOptions) => void;
}) => {
  const onClick = useCallback(() => {
    if (expandOption && onClickExpand) {
      onClickExpand(expandOption);
    }
  }, [expandOption, onClickExpand]);
  return (
    <SectionContainer>
      <SectionTitle level={5}>{title}</SectionTitle>
      {!!subtitle && (
        <Flex style={{ flexGrow: 1 }}>
          <SectionSubTitle size="small">{subtitle} &nbsp;</SectionSubTitle>
          <SectionLink onClick={onClick}>
            <Body
              style={{ color: Colors['text-icon--interactive--default'] }}
              size="small"
            >{`Learn more ->`}</Body>
          </SectionLink>
        </Flex>
      )}
    </SectionContainer>
  );
};

export const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-self: stretch;
  gap: 8px;
`;
export const SectionLink = styled.a`
  color: ${Colors['text-icon--interactive--default']};
  div:hover {
    text-decoration: underline;
  }
`;
export const SectionTitle = styled(Heading)`
  align-self: stretch;
`;

export const SectionSubTitle = styled(Body)``;
