import React from 'react';

import classNames from 'classnames';

interface Props {
  classes?: string;
  onClick?: () => void;
  dataTestId?: string;
  onMouseOver?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  className?: string;
  children?: React.ReactNode;
}

export const ButtonNoPropagation: React.FC<Props> = React.forwardRef<
  any,
  Props
>(
  (
    {
      children,
      classes,
      onClick,
      dataTestId,
      onMouseOver,
      onMouseLeave,
      onFocus,
      className,
    },
    ref
  ) => {
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <div
        data-testid={dataTestId}
        ref={ref}
        className={classNames(classes, className)}
        onClick={(event) => {
          event.stopPropagation();

          if (onClick) {
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
      >
        {children}
      </div>
    );
  }
);
