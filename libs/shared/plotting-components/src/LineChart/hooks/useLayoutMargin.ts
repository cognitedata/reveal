import { useState } from 'react';

import { Layout as PlotlyLayout } from 'plotly.js';
import { Axis, Layout } from '../types';
import { getLayoutMargin } from '../utils/getLayoutMargin';

export interface Props {
  layout: Layout;
  xAxis?: Axis;
  yAxis?: Axis;
}

export const useLayoutMargin = (props: Props) => {
  const [margin, setMargin] = useState<PlotlyLayout['margin']>();

  const updateLayoutMargin = (graph: HTMLElement | null) => {
    const margin = getLayoutMargin({ graph, ...props });
    setMargin(margin);
  };

  return { margin, updateLayoutMargin };
};
