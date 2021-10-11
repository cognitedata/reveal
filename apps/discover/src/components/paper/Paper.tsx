import React from 'react';

import classNames from 'classnames';

import { PaperWrapper } from './elements';

const paperStyles = {
  0: {},
  1: {
    boxShadow:
      '0px 1px 3px rgba(0, 0, 0, 0.2), 0px 2px 2px rgba(0, 0, 0, 0.12), 0px 0px 2px rgba(0, 0, 0, 0.14)',
  },
  2: {
    boxShadow:
      '0px 1px 5px rgba(0, 0, 0, 0.2), 0px 3px 4px rgba(0, 0, 0, 0.12), 0px 2px 4px rgba(0, 0, 0, 0.14)',
  },
  3: {
    boxShadow:
      '0px 1px 8px rgba(0, 0, 0, 0.2), 0px 3px 4px rgba(0, 0, 0, 0.12), 0px 3px 3px rgba(0, 0, 0, 0.14)',
  },
  4: {
    boxShadow:
      '0px 1px 10px rgba(0, 0, 0, 0.2), 0px 4px 5px rgba(0, 0, 0, 0.12), 0px 2px 4px rgba(0, 0, 0, 0.14)',
  },
  6: {
    boxShadow:
      '0px 3px 5px rgba(0, 0, 0, 0.2), 0px 1px 18px rgba(0, 0, 0, 0.12), 0px 6px 10px rgba(0, 0, 0, 0.14)',
  },
  12: {
    boxShadow:
      ' 0px 7px 8px rgba(0, 0, 0, 0.2), 0px 5px 22px rgba(0, 0, 0, 0.12), 0px 12px 17px rgba(0, 0, 0, 0.14)',
  },
  16: {
    boxShadow:
      '0px 8px 10px rgba(0, 0, 0, 0.2), 0px 6px 30px rgba(0, 0, 0, 0.12), 0px 16px 24px rgba(0, 0, 0, 0.14)',
  },
  24: {
    boxShadow:
      '0px 11px 15px rgba(0, 0, 0, 0.2), 0px 9px 46px rgba(0, 0, 0, 0.12), 0px 24px 38px rgba(0, 0, 0, 0.14)',
  },
};

interface Props {
  className?: string;
  elevation?: 0 | 1 | 2 | 3 | 4 | 6 | 12 | 16 | 24;
  style?: Record<string, unknown>;
  children?: React.ReactNode;
}

// Deprecated: New method: 'Elevation' classNames from Cogs
export const Paper = React.forwardRef((props: Props, ref: any) => {
  const { className, elevation, children, ...rest } = props;
  const elevationStyle = paperStyles[elevation || 0];

  if (!elevationStyle) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `This elevation ${elevation} is not implemented. Please use 0, 1, 2, 3, 4, 6, 12, 16 or 24`
      );
    }
  }
  return (
    <PaperWrapper
      ref={ref}
      className={classNames(className)}
      style={{ ...elevationStyle }}
      {...rest}
    >
      {children}
    </PaperWrapper>
  );
});

export default Paper;
