/*!
 * Copyright 2024 Cognite AS
 */

import { useEffect } from 'react';

import { AxisGizmoOptions, AxisGizmoTool } from '@cognite/reveal/tools';
import { useReveal } from '..';

export { AxisGizmoOptions };

export const AxisGizmo = ({ options }: { options?: AxisGizmoOptions }) => {
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
