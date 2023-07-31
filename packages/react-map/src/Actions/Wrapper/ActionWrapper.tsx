import * as React from 'react';

import { MapAddedProps } from '../../types';
import { useOverlapObserver } from '../../hooks/useOverlapObserver';

import { Wrapper } from './elements';

/**
 * The action wrapper passes down the props from the map
 *
 * - adds observer to children, to detect overlaps
 * - adds styles
 *
 */
export const AddActionWrapper: React.FC<
  {
    renderChildren: (
      props: MapAddedProps
    ) => null | React.ReactElement | React.ReactElement[];
  } & MapAddedProps
> = ({ renderChildren, ...props }) => {
  const ref = useOverlapObserver();
  return <Wrapper ref={ref}>{renderChildren(props)}</Wrapper>;
};
