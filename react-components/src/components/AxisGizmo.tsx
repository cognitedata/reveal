/*!
 * Copyright 2024 Cognite AS
 */

import { useEffect, type ReactElement } from 'react';

import { AxisGizmoOptions, AxisGizmoTool } from '@cognite/reveal/tools';
import { useReveal } from './RevealCanvas/ViewerContext';

export { AxisGizmoOptions };

/**
 * A React wrapper around the AxisGizmoTool from Reveal
 */
export const AxisGizmo = ({ options }: { options?: AxisGizmoOptions }): ReactElement => {
  const viewer = useReveal();

  useEffect(() => {
    const axisGizmoTool = new AxisGizmoTool(options);
    axisGizmoTool.connect(viewer);

    return () => {
      axisGizmoTool.dispose();
    };
  }, [viewer, options]);

  return <></>;
};
