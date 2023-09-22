import { Chart } from '@cognite/charts-lib';

export const getVisibility = (chart: Chart | undefined) => chart?.public;
