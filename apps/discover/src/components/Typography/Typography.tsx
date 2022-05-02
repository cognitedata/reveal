import React from 'react';

import classNames from 'classnames';

const defaultHeadlineMapping: DefaultHeadlineMapping = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body1: 'p',
  body2: 'p',
  tinytext: 'span',
  label: 'span',
  microheader: 'span',
  longtext: 'span',
};

const typographyStyles = {
  /* Styles applied to the root element. */
  root: {
    // display: 'block',
    margin: 0,
  },

  body2: {
    /* Body 2 / Hind Regular */

    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: '24px',
    /* identical to box height, or 171% */

    /* Black — Medium Emphasis */
    // color: "rgba(0, 0, 0, 0.6)",
    mixBlendMode: 'normal',
  },

  body1: {
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 16,
    lineHeight: '24px',
    /* identical to box height, or 150% */

    /* Black — Medium Emphasis */
    // color: "rgba(0, 0, 0, 0.6)",
    mixBlendMode: 'normal',
    backgroundColor: 'transparent',
  },

  tinytext: {
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 12,
    lineHeight: '16px',
    /* identical to box height, or 133% */

    /* Black — Medium Emphasis */
    // color: "rgba(0, 0, 0, 0.6)",
    mixBlendMode: 'normal',
  },
  label: {
    fontStyle: 'normal',
    fontWeight: 500,
    fontSize: 12,
    lineHeight: '16px',
    /* identical to box height, or 133% */

    /* Black — Medium Emphasis */
    // color: "rgba(0, 0, 0, 0.6)",
    mixBlendMode: 'normal',
  },
  longtext: {
    fontStyle: 'normal',
    fontWeight: 500,
    fontSize: 10,
    lineHeight: '16px',
    /* identical to box height, or 160% */

    display: 'block',
    width: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    alignItems: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',

    /* Black — Medium Emphasis */
    // color: "rgba(0, 0, 0, 0.6)",
    mixBlendMode: 'normal',
  },
  microheader: {
    fontStyle: 'normal',
    fontWeight: 500,
    fontSize: 10,
    lineHeight: '16px',
    /* identical to box height, or 160% */

    display: 'flex',
    alignItems: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',

    /* Black — Medium Emphasis */
    // color: "rgba(0, 0, 0, 0.6)",
    mixBlendMode: 'normal',
  },

  h1: {
    fontStyle: 'normal',
    fontWeight: 300,
    fontSize: 48,
    lineHeight: '64px',
    /* identical to box height, or 133% */
    textTransform: 'uppercase',

    /* Black — High Emphasis */
    // color: "rgba(0, 0, 0, 0.87)",
    mixBlendMode: 'normal',
  },

  h2: {
    fontStyle: 'normal',
    fontWeight: 300,
    fontSize: 36,
    lineHeight: '48px',

    /* Black — High Emphasis */
    // color: "rgba(0, 0, 0, 0.87)",
    mixBlendMode: 'normal',
  },

  h3: {
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 30,
    lineHeight: '40px',
    /* identical to box height, or 133% */

    /* Black — High Emphasis */
    // color: "rgba(0, 0, 0, 0.87)",
    mixBlendMode: 'normal',
  },

  h4: {
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 24,
    lineHeight: '32px',
    /* identical to box height, or 133% */

    /* Black — High Emphasis */
    // color: "rgba(0, 0, 0, 0.87)",
    mixBlendMode: 'normal',
  },

  h5: {
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 20,
    lineHeight: '24px',
    /* identical to box height, or 120% */

    /* Black — High Emphasis */
    // color: "rgba(0, 0, 0, 0.87)",
    mixBlendMode: 'normal',
  },

  h6: {
    fontStyle: 'normal',
    fontWeight: 500,
    fontSize: 18,
    lineHeight: '24px',
    /* identical to box height, or 133% */

    /* Black — High Emphasis */
    // color: "rgba(0, 0, 0, 0.87)",
    mixBlendMode: 'normal',
  },

  default: {},

  regular: {
    fontWeight: 'normal',
  },
  light: {
    fontWeight: 300,
  },
  medium: {
    fontWeight: 500,
  },
  semibold: {
    fontWeight: 600,
  },
};

interface DefaultHeadlineMapping {
  [x: string]: any;
}

interface Props {
  className?: string;
  component?: 'span' | 'p' | 'div';
  variant?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'body1'
    | 'body2'
    | 'tinytext'
    | 'label'
    | 'microheader'
    | 'longtext'
    | 'default';
  paragraph?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'p';
  style?: Record<string, unknown>;
  weight?: 'regular' | 'light' | 'medium' | 'semibold';
  color?: 'primary' | 'secondary' | 'default';
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const Typography: React.FC<Props> = React.forwardRef((props, ref) => {
  const {
    className,
    component,
    variant,
    color,
    paragraph,
    style,
    weight,
    children,
    ...rest
  } = props;
  const variantOrDefault = variant || 'default';
  const variantStyles = typographyStyles[variantOrDefault];
  const weightStyles = typographyStyles[weight || 'regular'];

  const Component =
    component ||
    (paragraph ? 'p' : defaultHeadlineMapping[variantOrDefault]) ||
    'span';
  return React.createElement(
    Component,
    {
      className: classNames(className),
      style: {
        ...typographyStyles.root,
        ...variantStyles,
        ...weightStyles,
        ...(style || {}),
      },
      ref,
      color,
      ...rest,
    },
    children
  );
});

export default Typography;
