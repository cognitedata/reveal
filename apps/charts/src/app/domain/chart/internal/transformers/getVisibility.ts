import { Chart } from '@charts-app/models/chart/types';

export const getVisibility = (chart: Chart | undefined) => chart?.public;
