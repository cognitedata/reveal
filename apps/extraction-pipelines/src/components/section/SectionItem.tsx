import React from 'react';

import { Body, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

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
      <div>
        {title && (
          <Body level={3} strong>
            {title}
          </Body>
        )}
        <StyledItemValue>{value}</StyledItemValue>
      </div>
      {extraContent && <div>{extraContent}</div>}
    </StyledItemContainer>
  );
};

const StyledItemContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;

  :not(:last-child) {
    margin-bottom: 12px;
  }
`;

const StyledItemValue = styled(Body).attrs({
  level: 3,
})`
  color: ${Colors['text-icon--medium']};
`;

export default SectionItem;
