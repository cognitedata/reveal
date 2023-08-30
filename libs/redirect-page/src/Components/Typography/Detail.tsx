import React from 'react';

export interface DetailProps<T> extends React.BaseHTMLAttributes<T> {
  as?: string;
  strong?: boolean;
}

export const Detail = <T extends HTMLSpanElement>({
  as,
  children,
  strong,
  className,
  style,
  ...rest
}: DetailProps<T>) => {
  return React.createElement(
    as || 'span',
    {
      ...rest,
      className: ['detail', strong && 'strong', className]
        .filter(Boolean)
        .join(' '),
      style,
    },
    children
  );
};
