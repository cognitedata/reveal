import { useEffect, useMemo, useState } from 'react';

import { PlotData, PlotHoverEvent } from 'plotly.js';

import head from 'lodash/head';

import { Data, Layout } from '../types';
import { adaptToPlotlyPlotData } from '../utils/adaptToPlotlyPlotData';
import { getHoveredChartData } from '../utils/getHoveredChartData';

export interface Props {
  data: Data | Data[];
  layout: Layout;
  plotHoverEvent?: PlotHoverEvent;
  backgroundColor?: string;
}

export const usePlotData = ({
  data,
  layout,
  plotHoverEvent,
  backgroundColor,
}: Props) => {
  const { showMarkers, showHoverMarker } = layout;

  const [plotData, setPlotData] = useState<Partial<PlotData>[]>([]);
  const [dataRevision, setDataRevision] = useState(1);

  const initialPlotData = useMemo(() => {
    return adaptToPlotlyPlotData(data, showMarkers);
  }, [data, showMarkers]);

  useEffect(() => {
    setPlotData(initialPlotData);
  }, [initialPlotData]);

  useEffect(() => {
    setDataRevision((currentDataRevision) => currentDataRevision + 1);
  }, [plotData]);

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

  return { plotData, dataRevision };
};
