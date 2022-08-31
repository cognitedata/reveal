import React, { FunctionComponent, PropsWithChildren } from 'react';
import { IconFilled } from 'components/styled';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

interface InfoBoxProps {
  iconType: string;
  color?: 'primary' | 'warning';
}
const colorMap = {
  primary: Colors['midblue-7'],
  warning: Colors['yellow-8'],
};

const Box = styled.div<Pick<InfoBoxProps, 'color'>>`
  display: grid;
  grid-template-areas: 'icon heading' '. content1' '. content2';
  grid-template-columns: 2rem auto;
  padding: 1rem;
  border-radius: 0.25rem;
  background-color: ${(p) => colorMap[p.color ?? 'primary'].hex()};
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
}: PropsWithChildren<InfoBoxProps>) => {
  return (
    <Box className="bottom-spacing" color={color}>
      <IconFilled color={Colors[color ?? 'primary'].hex()} type={iconType} />
      {children}
    </Box>
  );
};
