import { useState } from 'react';

import { Layout as PlotlyLayout } from 'plotly.js';

import { Axis, Layout } from '../types';
import { getLayoutMargin } from '../utils/getLayoutMargin';

import { useDeepCallback } from './useDeep';

export interface Props {
  layout: Layout;
  xAxis?: Axis;
  yAxis?: Axis;
}

export const useLayoutMargin = (props: Props) => {
  const [margin, setMargin] = useState<PlotlyLayout['margin']>();

  const updateLayoutMargin = useDeepCallback(
    (graph: HTMLElement | null) => {
      const margin = getLayoutMargin({ graph, ...props });
      setMargin(margin);
    },
    [props]
  );

  return { margin, updateLayoutMargin };
};
