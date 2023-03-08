import { useState } from 'react';

import { Layout as PlotlyLayout } from 'plotly.js';
import { Layout } from '../types';
import { getLayoutMargin } from '../utils/getLayoutMargin';

export const useLayoutMargin = (layout: Layout) => {
  const [margin, setMargin] = useState<PlotlyLayout['margin']>();

  const updateLayoutMargin = (graph: HTMLElement | null) => {
    const margin = getLayoutMargin(layout, graph);
    setMargin(margin);
  };

  return { margin, updateLayoutMargin };
};
