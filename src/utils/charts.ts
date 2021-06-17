import { Timeseries } from '@cognite/sdk';
import { AxisUpdate } from 'components/PlotlyChart';
import { nanoid } from 'nanoid';
import {
  Chart,
  ChartTimeSeries,
  ChartWorkflow,
  UserInfo,
} from 'reducers/charts/types';
import { getEntryColor } from './colors';
import { convertTsToWorkFlow } from './timeseries';

export function duplicate(chart: Chart, login: UserInfo): Chart {
  const id = nanoid();
  return {
    ...chart,
    id,
    updatedAt: Date.now(),
    createdAt: Date.now(),
    name: `${chart.name} Copy`,
    public: false,
    user: login.id,
    userInfo: login,
  };
}

function updateCollItem<T extends ChartTimeSeries | ChartWorkflow>(
  chart: Chart,
  collectionType: 'timeSeriesCollection' | 'workflowCollection',
  collId: string,
  diff: Partial<T>
): Chart {
  return {
    ...chart,
    // @ts-ignore
    [collectionType]: chart[collectionType]?.map((t) =>
      t.id === collId
        ? {
            ...t,
            ...diff,
          }
        : t
    ),
  };
}

function removeItem(
  chart: Chart,
  collectionType: 'timeSeriesCollection' | 'workflowCollection',
  collId: string
): Chart {
  return {
    ...chart,
    // @ts-ignore
    [collectionType]: chart[collectionType]?.filter((t) => t.id !== collId),
  };
}

function addItem<T extends ChartWorkflow | ChartTimeSeries>(
  chart: Chart,
  collectionType: 'timeSeriesCollection' | 'workflowCollection',
  item: T
): Chart {
  return {
    ...chart,
    [collectionType]: [...(chart[collectionType] || []), item],
  };
}

export function updateTimeseries(
  chart: Chart,
  tsId: string,
  update: Partial<ChartTimeSeries>
): Chart {
  return updateCollItem<ChartTimeSeries>(
    chart,
    'timeSeriesCollection',
    tsId,
    update
  );
}

export function removeTimeseries(chart: Chart, tsId: string): Chart {
  return removeItem(chart, 'timeSeriesCollection', tsId);
}
export function addTimeseries(chart: Chart, ts: ChartTimeSeries): Chart {
  return addItem(chart, 'timeSeriesCollection', ts);
}

export function updateWorkflow(
  chart: Chart,
  tsId: string,
  update: Partial<ChartWorkflow>
): Chart {
  return updateCollItem<ChartWorkflow>(
    chart,
    'workflowCollection',
    tsId,
    update
  );
}

export function removeWorkflow(chart: Chart, wfId: string): Chart {
  return removeItem(chart, 'workflowCollection', wfId);
}
export function duplicateWorkflow(chart: Chart, wfId: string): Chart {
  const wf = chart.workflowCollection?.find((w) => w.id === wfId);
  if (wf) {
    const newWf = {
      ...wf,
      id: nanoid(),
      name: `${wf.name} Copy`,
      color: getEntryColor(),
    };
    return addWorkflow(chart, newWf);
  }
  return chart;
}
export function addWorkflow(chart: Chart, wf: ChartWorkflow): Chart {
  return addItem(chart, 'workflowCollection', wf);
}

export function convertTimeseriesToWorkflow(chart: Chart, id: string): Chart {
  const ts = chart.timeSeriesCollection?.find((t) => t.id === id);
  if (ts) {
    return {
      ...chart,
      timeSeriesCollection: chart.timeSeriesCollection?.filter(
        (t) => t.id !== id
      ),
      workflowCollection: [
        ...(chart.workflowCollection || []),
        convertTsToWorkFlow(ts),
      ],
    };
  }
  return chart;
}

export function covertTSToChartTS(
  ts: Timeseries,
  range: number[] = []
): ChartTimeSeries {
  return {
    id: nanoid(),
    name: ts.name || ts.externalId || ts.id.toString(),
    tsId: ts.id,
    tsExternalId: ts.externalId,
    unit: ts.unit || '*',
    originalUnit: ts.unit || '*',
    preferredUnit: ts.unit || '*',
    color: getEntryColor(),
    lineWeight: 1,
    lineStyle: 'solid',
    displayMode: 'lines',
    enabled: true,
    description: ts.description || '-',
    range,
  };
}

export function updateSourceAxisForChart(
  chart: Chart,
  { x, y }: { x: string[]; y: AxisUpdate[] }
) {
  const updatedChart = {
    ...chart,
  };

  if (x.length === 2) {
    updatedChart.dateFrom = `${x[0]}`;
    updatedChart.dateTo = `${x[1]}`;
  }

  if (y.length > 0) {
    y.forEach((update) => {
      updatedChart.timeSeriesCollection = updatedChart.timeSeriesCollection?.map(
        (t) => (t.id === update.id ? { ...t, range: update.range } : t)
      );
      updatedChart.workflowCollection = updatedChart.workflowCollection?.map(
        (wf) => (wf.id === update.id ? { ...wf, range: update.range } : wf)
      );
    });
  }

  return updatedChart;
}

export const toggleDownloadChartElements = (hide: boolean, height?: number) => {
  const elementsToHide = document.getElementsByClassName('downloadChartHide');
  const tdToHide = document.getElementsByClassName('downloadChartHideTd');
  const chartViewEl = document.getElementById('chart-view');
  if (hide) {
    const pane2Height = +document
      .getElementsByClassName('Pane2')[0]
      // @ts-ignore
      .style.height.replace('px', '');
    Array.prototype.forEach.call(elementsToHide, (el) => {
      el.style.display = 'none';
    });
    Array.prototype.forEach.call(tdToHide, (el) => {
      el.style.display = 'none';
    });
    if (chartViewEl) {
      chartViewEl.style.overflow = 'auto';
      chartViewEl.style.height = 'auto';
    }
    // @ts-ignore
    document.querySelector(
      '.cogs-topbar--left .cogs-topbar--item__actions'
      // @ts-ignore
    ).style.display = 'none';
    // @ts-ignore
    document.querySelector(
      '.cogs-topbar--right .cogs-topbar--item__actions span:nth-child(1)'
      // @ts-ignore
    ).style.display = 'none';
    // @ts-ignore
    document.querySelector(
      '.cogs-topbar--right .cogs-topbar--item__actions span:nth-child(2)'
      // @ts-ignore
    ).style.display = 'none';
    // @ts-ignore
    document.getElementsByClassName('SplitPane')[0].style.overflow = 'auto';
    // @ts-ignore
    document.getElementsByClassName('SplitPane')[0].style.display = 'block';
    // @ts-ignore
    document.getElementsByClassName('SplitPane')[0].style.position = 'relative';
    // @ts-ignore
    document.getElementsByClassName('Pane1')[0].style.height = `${
      window.innerHeight - pane2Height - 130
    }px`;
    // @ts-ignore
    document.getElementsByClassName('Pane2')[0].style.height = 'auto';
    // @ts-ignore
    document.getElementsByClassName('Resizer')[0].style.display = 'none';
    // @ts-ignore
    document.getElementsByClassName('PageLayout')[0].style.height = 'auto';
    return pane2Height;
  }
  Array.prototype.forEach.call(elementsToHide, (el) => {
    el.style.display = 'flex';
  });
  Array.prototype.forEach.call(tdToHide, (el) => {
    el.style.display = 'table-cell';
  });
  if (chartViewEl) {
    chartViewEl.style.overflow = 'hidden';
    chartViewEl.style.height = '100%';
  }
  // @ts-ignore
  document.querySelector(
    '.cogs-topbar--left .cogs-topbar--item__actions'
    // @ts-ignore
  ).style.display = 'block';
  // @ts-ignore
  document.querySelector(
    '.cogs-topbar--right .cogs-topbar--item__actions span:nth-child(1)'
    // @ts-ignore
  ).style.display = 'block';
  // @ts-ignore
  document.querySelector(
    '.cogs-topbar--right .cogs-topbar--item__actions span:nth-child(2)'
    // @ts-ignore
  ).style.display = 'block';
  // @ts-ignore
  document.getElementsByClassName('SplitPane')[0].style.overflow = 'hidden';
  // @ts-ignore
  document.getElementsByClassName('SplitPane')[0].style.display = 'flex';
  // @ts-ignore
  document.getElementsByClassName('SplitPane')[0].style.position = 'absolute';
  // @ts-ignore
  document.getElementsByClassName('Pane1')[0].style.height = 'auto';
  document.getElementsByClassName(
    'Pane2'
    // @ts-ignore
  )[0].style.height = `${height}px`;
  // @ts-ignore
  document.getElementsByClassName('Resizer')[0].style.display = 'block';
  // @ts-ignore
  document.getElementsByClassName('PageLayout')[0].style.height = '100vh';
  return 0;
};
