import React, { FunctionComponent } from 'react';
import { IconFilled } from '@extraction-pipelines/components/styled';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

interface InfoBoxProps {
  children: React.ReactNode;
  iconType: string;
  color?: 'primary' | 'warning';
}
const colorMap = {
  primary: Colors['surface--status-neutral--muted--default'],
  warning: Colors['surface--status-warning--muted--default'],
};

const Box = styled.div<Pick<InfoBoxProps, 'color'>>`
  display: grid;
  grid-template-areas: 'icon heading' '. content1' '. content2';
  grid-template-columns: 2rem auto;
  padding: 1rem;
  border-radius: 0.25rem;
  background-color: ${(p) => colorMap[p.color ?? 'primary']};
  h2 {
    grid-area: heading;
  }
  .cogs-icon {
    grid-area: icon;
    justify-self: start;
    align-self: center;
  }
  .box-content {
    &:nth-child(3) {
      grid-area: content1;
    }
    &:nth-child(4) {
      grid-area: content2;
    }
  }
`;

export const InfoBox: FunctionComponent<InfoBoxProps> = ({
  iconType,
  children,
  color,
}: InfoBoxProps): JSX.Element => {
  return (
    <Box className="bottom-spacing" color={color}>
      <IconFilled
        color={
          Colors[
            color === 'warning'
              ? 'text-icon--status-warning'
              : 'text-icon--status-neutral'
          ]
        }
        type={iconType}
      />
      {children}
    </Box>
  );
};
