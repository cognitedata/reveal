import { scaleLinear } from 'd3';

import {
  ChartAxis,
  Dimensions,
  Margins,
  GroupedData,
  Accessors,
} from 'components/Charts/types';

export type Data = { label: string; group: string; count: number };

export const data: Data[] = [
  { label: 'Label1', group: 'A', count: 50.25 },
  { label: 'Label2', group: 'A', count: 80 },
  { label: 'Label2', group: 'B', count: 30.5 },
  { label: 'Label1', group: 'B', count: 90.28 },
  { label: 'Label1', group: 'A', count: 20 },
];

export const groupedData: GroupedData<Data> = {
  Label1: [
    { label: 'Label1', group: 'A', count: 50.25 },
    { label: 'Label1', group: 'B', count: 90.28 },
    { label: 'Label1', group: 'A', count: 20 },
  ],
  Label2: [
    { label: 'Label2', group: 'A', count: 80 },
    { label: 'Label2', group: 'B', count: 30.5 },
  ],
};

export const groupedDataWithSummedValuesInsideBars = {
  Label1: [
    { label: 'Label1', group: 'A', count: 70.25 },
    { label: 'Label1', group: 'B', count: 90.28 },
  ],
  Label2: [
    { label: 'Label2', group: 'A', count: 80 },
    { label: 'Label2', group: 'B', count: 30.5 },
  ],
};

export const chartDimensions: Dimensions = { height: 300, width: 400 };

export const margins: Margins = { top: 5, right: 5, bottom: 5, left: 5 };

export const spacings = { x: 100, y: 100 };

export const xScaleMaxValue = 161;

export const xAccessor: keyof Data = 'count';
export const yAccessor: keyof Data = 'label';
export const accessors: Accessors = { x: xAccessor, y: yAccessor };

export const xAxis: ChartAxis = { accessor: xAccessor };
export const yAxis: ChartAxis = { accessor: yAccessor };

export const xScale = scaleLinear().domain([0, 100]).range([0, 100]);
