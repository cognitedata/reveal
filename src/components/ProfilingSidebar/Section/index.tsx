import React from 'react';
import styled from 'styled-components';

import { Colors, Body } from '@cognite/cogs.js';

import { Frequency } from './Frequency';
import { Distribution } from './Distribution';

type Props = { children: React.ReactNode; title?: string; isHalf?: boolean };

export const Section = ({
  children,
  title,
  isHalf = false,
}: Props): JSX.Element => {
  return (
    <StyledSection isHalf={isHalf}>
      {title && (
        <Body level={2} strong>
          {title}
        </Body>
      )}
      {children}
    </StyledSection>
  );
};

Section.Frequency = Frequency;
Section.Distribution = Distribution;

const StyledSection = styled.div.attrs(({ isHalf }: { isHalf?: boolean }) => {
  const style: React.CSSProperties = {
    flex: isHalf ? '1 1 45%' : '1 1 100%',
    maxWidth: isHalf ? '50%' : '100%',
  };
  return { style };
})<{ isHalf?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  height: auto;
  padding: 12px;
  margin: 6px;
  box-sizing: border-box;
  background-color: ${Colors['greyscale-grey1'].hex()};
  border-radius: 8px;
`;
