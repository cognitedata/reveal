import React from 'react';

export interface BodyProps<T> extends React.BaseHTMLAttributes<T> {
  level?: string | number;
  as?: string;
  strong?: boolean;
}

export const Body = <T extends HTMLSpanElement>({
  level = 1,
  as,
  children,
  strong,
  className,
  style,
  ...rest
}: BodyProps<T>) => {
  return React.createElement(
    as || `div`,
    {
      ...rest,
      className: [`body-${level}`, strong && 'strong', className]
        .filter(Boolean)
        .join(' '),
      style,
    },
    children
  );
};
