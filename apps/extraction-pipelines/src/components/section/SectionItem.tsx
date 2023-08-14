import React from 'react';

import styled from 'styled-components';

import { Body, Colors } from '@cognite/cogs.js';

export type SectionItemProps = {
  extraContent?: React.ReactNode;
  key: string;
  title?: string | React.ReactNode;
  value: string | React.ReactNode;
};

const SectionItem = ({
  extraContent,
  title,
  value,
}: SectionItemProps): JSX.Element => {
  return (
    <StyledItemContainer>
      <StyledItemContent>
        {title && (
          <Body size="medium" strong>
            {title}
          </Body>
        )}
        <StyledItemValue size="medium">{value ?? '-'}</StyledItemValue>
      </StyledItemContent>
      {extraContent && <div>{extraContent}</div>}
    </StyledItemContainer>
  );
};

const StyledItemContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: space-between;

  :not(:last-child) {
    margin-bottom: 12px;
  }
`;

const StyledItemContent = styled.div`
  flex: 1;
`;

const StyledItemValue = styled(Body)`
  color: ${Colors['text-icon--medium']};
`;

export default SectionItem;
