import { useMemo } from 'react';
import { Data, PlotRange } from '../types';
import { getPlotRange } from '../utils/getPlotRange';

interface Props {
  data: Data | Data[];
  showMarkers: boolean;
}

export const usePlotDataRange = ({
  data,
  showMarkers,
}: Props): PlotRange | undefined => {
  const plotRange = useMemo(() => getPlotRange(data), [data]);

  return useMemo(() => {
    if (!plotRange || !showMarkers) {
      return plotRange;
    }

    const {
      x: [xMin, xMax],
      y: [yMin, yMax],
    } = plotRange;

    const marginX = (xMax - xMin) * 0.015;
    const marginY = (yMax - yMin) * 0.055;

    return {
      x: [xMin - marginX, xMax + marginX],
      y: [yMin - marginY, yMax + marginY],
    };
  }, [plotRange, showMarkers]);
};
