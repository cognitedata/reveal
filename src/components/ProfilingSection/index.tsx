import React from 'react';
import styled from 'styled-components';

import { Colors, Body } from '@cognite/cogs.js';

import { SectionFrequency } from './SectionFrequency';
import { SectionDistribution } from './SectionDistribution';
import { SectionDistinctValues } from './SectionDistinctValues';

export const DATA_MISSING = 'MISSING';

type Props = {
  children: React.ReactNode;
  title?: string;
  isHalf?: boolean;
  isCompact?: boolean;
  style?: React.CSSProperties;
};

export const Section = ({
  children,
  title,
  isHalf = false,
  isCompact = false,
  style = {},
}: Props): JSX.Element => {
  return (
    <StyledSection isHalf={isHalf} isCompact={isCompact} style={style}>
      {title && (
        <Body level={2} strong style={{ marginBottom: '4px' }}>
          {title}
        </Body>
      )}
      {children}
    </StyledSection>
  );
};

Section.Frequency = SectionFrequency;
Section.Distribution = SectionDistribution;
Section.DistinctValues = SectionDistinctValues;

const StyledSection = styled.div.attrs(
  ({
    isHalf,
    isCompact,
    style,
  }: {
    isHalf?: boolean;
    isCompact?: boolean;
    style: React.CSSProperties;
  }) => {
    const defaultStyle: React.CSSProperties = {
      flex: isHalf ? '1 1 45%' : '1 1 100%',
      maxWidth: isHalf ? '50%' : '100%',
      backgroundColor: Colors.white.hex(),
      padding: '20px',
    };
    const compactStyle: React.CSSProperties = {
      borderRadius: '8px',
      backgroundColor: Colors['greyscale-grey1'].hex(),
      padding: '8px 12px',
    };
    const newStyle: React.CSSProperties = {
      ...defaultStyle,
      ...(isCompact ? compactStyle : {}),
      ...style,
    };
    return { style: newStyle };
  }
)<{ isHalf?: boolean; isCompact?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  height: auto;
  margin: 6px;
  box-sizing: border-box;
`;
