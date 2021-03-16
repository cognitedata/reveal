import { nanoid } from 'nanoid';
import { Chart } from 'reducers/charts/types';

export function duplicate(chart: Chart, user: string): Chart {
  const id = nanoid();
  return {
    ...chart,
    id,
    name: `${chart.name} Copy`,
    public: false,
    user,
  };
}
