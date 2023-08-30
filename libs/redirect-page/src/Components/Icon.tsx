import React from 'react';

import styled from 'styled-components';

import icons from '../assets/icons';

type Props = {
  type: IconType;
  color?: string;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
  title?: string;
};

export const Icon = (props: Props): JSX.Element => {
  const { type, color, size, title, style = {} } = props;
  const src = icons[type];

  return (
    <StyledIcon
      src={src}
      style={style}
      size={size}
      color={color}
      title={title}
    />
  );
};

export type IconType = keyof typeof icons;

const StyledIcon = styled.div.attrs(
  (props: Partial<Props> & { src: string }) => {
    const { style = {} } = props;
    return { style };
  }
)<Partial<Props> & { src: string }>`
  -webkit-mask: ${({ src }) => `url(${src}) no-repeat center`};
  mask: ${({ src }) => `url(${src}) no-repeat center`};
  background-color: ${({ color }) => color ?? '#ffffff'};
  width: ${({ size }) => size ?? 32}px;
  height: ${({ size }) => size ?? 32}px;
`;
