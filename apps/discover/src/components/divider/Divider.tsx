import React from 'react';

import styled from 'styled-components/macro';

import { useTheme } from 'styles/useTheme';

interface Props {
  color?: 'gray' | 'blue';
  size?: 'small' | 'large';
}

const DividerWrapper = styled.hr`
  border: none;
  margin: 0;
  flex-shrink: 0;
  height: ${(props: Props) => (props.size === 'large' ? '2.2px' : '1px')};
  background-color: ${(props: Props) => props.color};
`;

export const Divider: React.FC<Props> = ({ color, ...rest }) => {
  const theme = useTheme();
  const translateToThemeColor = color
    ? theme.palette[color]
    : theme.palette.gray;

  return <DividerWrapper color={translateToThemeColor} {...rest} />;
};

export default Divider;
