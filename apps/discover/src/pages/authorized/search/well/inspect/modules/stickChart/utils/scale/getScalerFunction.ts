import { ScaleLinear, scaleLinear } from 'd3-scale';
import head from 'lodash/head';
import last from 'lodash/last';

export const getScalerFunction = (
  scaleBlocks: number[]
): ScaleLinear<number, number> => {
  return scaleLinear()
    .domain([head(scaleBlocks) || 0, last(scaleBlocks) || 0])
    .range([0, scaleBlocks.length - 1]);
};
