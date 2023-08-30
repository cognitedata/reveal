import React from 'react';

export interface TitleProps<T> extends React.BaseHTMLAttributes<T> {
  level?: string | number;
  as?: string;
}

export const Title = <T extends HTMLHeadingElement>({
  level = 1,
  as,
  children,
  className,
  style,
  ...rest
}: TitleProps<T>) => {
  return React.createElement(
    as || `h${level}`,
    {
      ...rest,
      className: [`title-${level}`, className].filter(Boolean).join(' '),
      style,
    },
    children
  );
};
