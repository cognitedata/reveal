import React from 'react';
import styled from 'styled-components';

import { Colors, Body } from '@cognite/cogs.js';

import { Frequency } from './Frequency';
import { Distribution } from './Distribution';
import { DistinctValues } from './DistinctValues';

export const DATA_MISSING = 'MISSING';

type Props = {
  children: React.ReactNode;
  title?: string;
  isHalf?: boolean;
  isCompact?: boolean;
};

export const Section = ({
  children,
  title,
  isHalf = false,
  isCompact = false,
}: Props): JSX.Element => {
  return (
    <StyledSection isHalf={isHalf} isCompact={isCompact}>
      {title && (
        <Body level={2} strong style={{ marginBottom: '8px' }}>
          {title}
        </Body>
      )}
      {children}
    </StyledSection>
  );
};

Section.Frequency = Frequency;
Section.Distribution = Distribution;
Section.DistinctValues = DistinctValues;

const StyledSection = styled.div.attrs(
  ({ isHalf, isCompact }: { isHalf?: boolean; isCompact?: boolean }) => {
    const defaultStyle: React.CSSProperties = {
      flex: isHalf ? '1 1 45%' : '1 1 100%',
      maxWidth: isHalf ? '50%' : '100%',
      backgroundColor: Colors.white.hex(),
    };
    const compactStyle: React.CSSProperties = {
      borderRadius: '8px',
      backgroundColor: Colors['greyscale-grey1'].hex(),
    };
    const style: React.CSSProperties = {
      ...defaultStyle,
      ...(isCompact ? compactStyle : {}),
    };
    return { style };
  }
)<{ isHalf?: boolean; isCompact?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  height: auto;
  padding: 12px;
  margin: 6px;
  box-sizing: border-box;
`;
