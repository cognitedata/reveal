import React from 'react';

import { IconType } from '../../Components/Icon';

export type ButtonType =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'ghost'
  | 'danger'
  | 'link'
  | 'ghost-danger';
export type ButtonVariant = 'default' | 'inverted' | 'ghost' | 'outline';
export type ButtonSize = 'default' | 'small' | 'large';
export type ButtonShape = 'default' | 'round';

type HtmlElementProps = React.HTMLAttributes<HTMLButtonElement>;

export interface ButtonProps extends HtmlElementProps {
  type?: ButtonType;
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  icon?: IconType;
  toggled?: boolean;
  loading?: boolean;
  unstyled?: boolean;
  disabled?: boolean;
  block?: boolean;
  iconPlacement?: 'left' | 'right';
  htmlType?: 'button' | 'submit' | 'reset';
  href?: string;
  target?: string;
}
