import React, { FunctionComponent, PropsWithChildren } from 'react';
import { IconFilled } from 'styles/StyledIcon';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { AllIconTypes } from '@cognite/cogs.js/dist/Atoms/Icon/Icon';

const Box = styled.div`
  display: grid;
  grid-template-areas: 'icon heading' '. content1' '. content2';
  grid-template-columns: 2rem auto;
  padding: 1rem;
  border-radius: 0.25rem;
  background-color: ${(props: { boxColor?: string }) =>
    props.boxColor ?? `${Colors['midblue-7'].hex()}`};
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
interface InfoBoxProps {
  iconType: AllIconTypes;
}

export const InfoBox: FunctionComponent<InfoBoxProps> = ({
  iconType,
  children,
}: PropsWithChildren<InfoBoxProps>) => {
  return (
    <Box className="bottom-spacing">
      <IconFilled type={iconType} />
      {children}
    </Box>
  );
};
