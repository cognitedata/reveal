import { Config, Layout } from '../../../LineChart';

export const LAYOUT: Partial<Layout> = {
  showLegend: false,
};

export const CONFIG: Partial<Config> = {
  scrollZoom: 'x',
  selectionZoom: [
    { trigger: 'default', direction: 'x+y' },
    { trigger: 'Shift', direction: 'x' },
  ],
  buttonZoom: 'x',
};
