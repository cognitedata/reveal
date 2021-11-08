import { AxisBase } from 'components/charts/common/Axis';
import { Dimensions, Margins, GroupedData } from 'components/charts/types';

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

export const xAxis: AxisBase = { accessor: 'count' };
export const yAxis: AxisBase = { accessor: 'label' };
export const accessors = { x: xAxis.accessor, y: yAxis.accessor };
