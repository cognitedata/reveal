import CSS from 'csstype';
import { Data, PlotHoverEvent } from 'plotly.js';

export interface TooltipOffset {
  top: number;
  left: number;
}

export type CommonChartProps = {
  title: string | undefined;
  subTitle: string | undefined;
  data: Data[];
  layout: Partial<Plotly.Layout>;
  chartStyles: CSS.Properties;
  onHover?: (event: PlotHoverEvent) => void;
  onUnhover?: () => void;
};

export const getPointOffset = (
  point: Plotly.PlotDatum,
  additionalOffset: { left: number; top: number } = { left: 0, top: 0 }
): TooltipOffset => {
  const { x, y, xaxis, yaxis } = point;
  return {
    left:
      (xaxis as any).l2p(new Date(x as string).valueOf()) +
      additionalOffset.left,
    top: (yaxis as any).l2p(y) + additionalOffset.top,
  };
};

export const chartPropsAreEqual = (
  prevProps: CommonChartProps,
  nextProps: CommonChartProps
) => {
  if (prevProps.title !== nextProps.title) {
    return false;
  }
  if (prevProps.subTitle !== nextProps.subTitle) {
    return false;
  }
  if (JSON.stringify(prevProps.data) !== JSON.stringify(nextProps.data)) {
    return false;
  }
  return true;
};
