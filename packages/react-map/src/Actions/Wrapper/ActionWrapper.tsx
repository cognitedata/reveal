import * as React from 'react';

import { MapAddedProps } from '../../types';

import { Wrapper } from './elements';

export const ActionWrapper: React.FC<
  React.PropsWithChildren<MapAddedProps>
> = ({ children, ...props }) => {
  return (
    <Wrapper>
      {React.Children.map(children, (child) => {
        // Checking isValidElement is the safe way
        // and avoids a typescript error too.
        if (React.isValidElement(child)) {
          return React.cloneElement(child, props);
        }
        return child;
      })}
    </Wrapper>
  );
};
