import React from 'react';

export type Justify =
  | 'space-between'
  | 'space-around'
  | 'center'
  | 'end'
  | 'start'
  | undefined;

export type NavOptions = {
  disabled?: boolean;
  text?: string;
  tooltip?: React.ReactNode;
  onClick?: () => void;
};
