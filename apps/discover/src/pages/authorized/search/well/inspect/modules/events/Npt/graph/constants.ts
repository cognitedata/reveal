import { StackedBarChartOptions } from 'components/charts/modules/StackedBarChart';
import { NPTEvent } from 'modules/wellSearch/types';

import { accessors, colors, DEFAULT_NPT_COLOR } from '../constants';

import { formatTooltip } from './utils';

export const NO_NPT_DATA_COLOR = '#00000010';

export const GRAPH_TITLE = 'NPT data by wells';
export const GRAPH_X_AXIS_TITLE = 'Duration (days)';
export const GRAPH_LEGEND_TITLE = 'NPT Codes';

export const NO_DATA_AMONG_SELECTED_NPT_CODES_TEXT =
  'No data among the selected NPT codes';
export const NO_DATA_TEXT = 'No data';

export const NPT_GRAPH_OPTIONS: StackedBarChartOptions<NPTEvent> = {
  colorConfig: {
    colors,
    accessor: accessors.NPT_CODE,
    defaultColor: DEFAULT_NPT_COLOR,
    noDataColor: NO_NPT_DATA_COLOR,
  },
  legendOptions: {
    title: GRAPH_LEGEND_TITLE,
    overlay: true,
  },
  formatTooltip,
  fixXValuesToDecimalPlaces: 1,
  noDataAmongSelectedCheckboxesText: NO_DATA_AMONG_SELECTED_NPT_CODES_TEXT,
  noDataText: NO_DATA_TEXT,
};
