import { useEffect, useMemo, useState } from 'react';

import { PlotData, PlotHoverEvent } from 'plotly.js';

import head from 'lodash/head';

import { Data, Layout, Variant } from '../types';
import { adaptToPlotlyPlotData } from '../utils/adaptToPlotlyPlotData';
import { getHoveredChartData } from '../utils/getHoveredChartData';
import { checkIsEmptyData } from '../utils/checkIsEmptyData';

export interface Props {
  data: Data | Data[];
  layout: Layout;
  plotHoverEvent?: PlotHoverEvent;
  backgroundColor?: string;
  variant?: Variant;
}

export const usePlotData = ({
  data,
  layout,
  plotHoverEvent,
  backgroundColor,
  variant,
}: Props) => {
  const { showMarkers, showHoverMarker } = layout;

  const [plotData, setPlotData] = useState<Partial<PlotData>[]>([]);

  const initialPlotData = useMemo(() => {
    return adaptToPlotlyPlotData(data, showMarkers, variant);
  }, [data, showMarkers, variant]);

  const isEmptyData = useMemo(() => {
    return checkIsEmptyData(data);
  }, [data]);

  useEffect(() => {
    setPlotData(initialPlotData);
  }, [initialPlotData]);

  useEffect(() => {
    if (!showHoverMarker) {
      return;
    }

    const updatedData = getHoveredChartData(
      initialPlotData,
      head(plotHoverEvent?.points),
      backgroundColor
    );
    setPlotData(updatedData);
  }, [backgroundColor, initialPlotData, plotHoverEvent, showHoverMarker]);

  return { plotData, isEmptyData };
};
