import React from 'react';

import styled from 'styled-components';

import { Colors } from '../../Components/Colors';
import { Icon } from '../../Components/Icon';

import { ButtonType, ButtonSize, ButtonProps } from './types';

export const Button = (props: ButtonProps) => {
  const {
    children,
    disabled = false,
    icon,
    iconPlacement,
    size,
    type = 'primary',
    ...rest
  } = props;

  const $type = disabled ? 'disabled' : type;
  return (
    <StyledButton
      disabled={disabled}
      type="button"
      $type={$type}
      $size={size}
      {...rest}
    >
      {icon && (!iconPlacement || iconPlacement === 'left') && (
        <Icon
          type={icon}
          size={16}
          color={styleMap[$type].color}
          style={{ margin: '0 4px' }}
        />
      )}
      {children}
      {icon && iconPlacement === 'right' && (
        <Icon
          type={icon}
          size={16}
          color={styleMap[$type].color}
          style={{ margin: '0 4px' }}
        />
      )}
    </StyledButton>
  );
};

type Props = {
  // See https://github.com/yannickcr/eslint-plugin-react/issues/1555
  // eslint-disable-next-line react/button-has-type
  type: 'button';
  disabled: boolean;
  $type: ButtonType | 'disabled';
  $size?: ButtonSize;
  style?: React.CSSProperties;
};

const StyledButton = styled.button<Props>`
  display: inline-flex;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  line-height: 1;
  outline: none;
  transition: 0.3s all;
  user-select: none;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  height: ${({ $size }) => ($size === 'small' ? 24 : 32)}px;
  padding: ${({ $size }) => ($size === 'small' ? '4px 8px' : '6px 12px')};
  background-color: ${({ $type }) => styleMap[$type].bgColor};
  color: ${({ $type }) => styleMap[$type].color};
  border: ${({ $type }) => styleMap[$type].border ?? 'none'};
  &:hover {
    background-color: ${({ $type }) => styleMap[$type].bgColorHover};
    color: ${({ $type }) =>
      styleMap[$type].colorHover ?? styleMap[$type].color};
  }
`;

const styleMap: Record<
  Partial<ButtonType | 'disabled'>,
  {
    bgColor: string;
    bgColorHover?: string;
    color: string;
    colorHover?: string;
    border?: string;
  }
> = {
  primary: {
    bgColor: Colors.midblue,
    bgColorHover: Colors['midblue-2'],
    color: Colors.white,
  },
  secondary: {
    bgColor: '#efefef',
    bgColorHover: Colors['greyscale-grey4'],
    color: Colors['greyscale-grey8'],
  },
  tertiary: {
    bgColor: Colors.white,
    bgColorHover: Colors['greyscale-grey2'],
    color: Colors['greyscale-grey9'],
    colorHover: Colors['greyscale-grey8'],
    border: `1px solid ${Colors['greyscale-grey5']}`,
  },
  ghost: {
    bgColor: 'transparent',
    bgColorHover: Colors['greyscale-grey2'],
    color: Colors['greyscale-grey7'],
    colorHover: Colors['greyscale-grey8'],
  },
  link: {
    bgColor: 'transparent',
    bgColorHover: Colors['midblue-8'],
    color: Colors.midblue,
  },
  danger: {
    bgColor: Colors.red,
    bgColorHover: Colors['red-2'],
    color: Colors.white,
  },
  'ghost-danger': {
    bgColor: 'transparent',
    bgColorHover: Colors['red-8'],
    color: Colors['red-2'],
    colorHover: Colors['red-1'],
  },
  disabled: {
    bgColor: Colors['greyscale-grey3'],
    color: Colors['greyscale-grey6'],
  },
};
