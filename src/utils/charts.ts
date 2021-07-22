import { Timeseries } from '@cognite/sdk';
import { AxisUpdate } from 'components/PlotlyChart';
import { nanoid } from 'nanoid';
import {
  Chart,
  ChartTimeSeries,
  ChartWorkflow,
  SourceCollectionData,
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
      color: getEntryColor(chart.id, wf.id),
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
    const filteredTsCollection = chart.timeSeriesCollection?.filter(
      (t) => t.id !== id
    );
    const workflow = convertTsToWorkFlow(chart.id, ts);
    const filteredWorkFlowCollection = [
      ...(chart.workflowCollection || []),
      workflow,
    ];

    return {
      ...chart,
      timeSeriesCollection: filteredTsCollection,
      workflowCollection: filteredWorkFlowCollection,
      sourceCollection: chart.sourceCollection?.map((x) =>
        x.id === ts.id ? { type: 'workflow', id: workflow.id } : x
      ),
    };
  }
  return chart;
}

export function covertTSToChartTS(
  ts: Timeseries,
  chartId: string,
  range: number[] = []
): ChartTimeSeries {
  return {
    id: nanoid(),
    name: ts.name || ts.externalId || ts.id.toString(),
    tsId: ts.id,
    tsExternalId: ts.externalId,
    unit: ts.unit || '*',
    type: 'timeseries',
    originalUnit: ts.unit || '*',
    preferredUnit: ts.unit || '*',
    color: getEntryColor(chartId, ts.id.toString()),
    lineWeight: 1,
    lineStyle: 'solid',
    displayMode: 'lines',
    enabled: true,
    description: ts.description || '-',
    range,
    createdAt: Date.now(),
  };
}

export function initializeSourceCollection(chart: Chart): Chart {
  return {
    ...chart,
    sourceCollection: [
      ...(chart?.timeSeriesCollection || []).map((ts) => ({
        type: ts.type ?? 'timeseries',
        id: ts.id,
      })),
      ...(chart?.workflowCollection || []).map((flow) => ({
        id: flow.id,
        type: flow.type ?? 'workflow',
      })),
    ] as SourceCollectionData[],
  };
}

export function updateSourceCollection(chart: Chart): Chart {
  console.log('Fdsfs');
  // Filter removed timeseries/workflow
  const filteredSourceCollection = (chart?.sourceCollection || []).filter(
    (x) =>
      (x.type === 'timeseries'
        ? chart?.timeSeriesCollection?.find((ts) => ts.id === x.id)
        : chart?.workflowCollection?.find((flow) => flow.id === x.id)) !==
      undefined
  );

  // merged together two list.
  const mergedCollection: (ChartTimeSeries | ChartWorkflow)[] = [
    ...(chart?.timeSeriesCollection || []).map((x) => ({
      ...x,
      type: x.type ?? 'timeseries',
    })),
    ...(chart?.workflowCollection || []).map((x) => ({
      ...x,
      type: x.type ?? 'workflow',
    })),
  ];

  // find new source that is not added.
  const notAddedSources = mergedCollection
    .filter(
      (x) =>
        filteredSourceCollection.find((src) => x.id === src.id) === undefined
    )
    .map((x) => ({ id: x.id, type: x.type!! }));

  // add it to the top.
  const filteredSourceCollectionChart = {
    ...chart,
    sourceCollection: [...notAddedSources, ...filteredSourceCollection],
  };

  return filteredSourceCollectionChart;
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
  const chartViewEl = document.getElementById('chart-view');
  const splitPane = (document.getElementsByClassName(
    'SplitPane'
  )[0] as HTMLElement).style;
  if (hide) {
    const pane2Height = +(document.getElementsByClassName(
      'Pane2'
    )[0] as HTMLElement).style.height.replace('px', '');
    Array.prototype.forEach.call(elementsToHide, (el) => {
      el.style.display = 'none';
    });
    if (chartViewEl) {
      chartViewEl.style.overflow = 'auto';
      chartViewEl.style.height = 'auto';
    }
    splitPane.overflow = 'auto';
    splitPane.display = 'block';
    splitPane.position = 'relative';
    (document.getElementsByClassName(
      'Pane1'
    )[0] as HTMLElement).style.height = `${
      window.innerHeight - pane2Height - 130
    }px`;
    (document.getElementsByClassName('Pane2')[0] as HTMLElement).style.height =
      'auto';
    (document.getElementsByClassName(
      'Resizer'
    )[0] as HTMLElement).style.display = 'none';
    (document.getElementsByClassName(
      'PageLayout'
    )[0] as HTMLElement).style.height = 'auto';
    return pane2Height;
  }
  Array.prototype.forEach.call(elementsToHide, (el: HTMLElement) => {
    el.style.display =
      el.nodeName === 'TH' || el.nodeName === 'TD' ? 'table-cell' : 'flex';
  });
  if (chartViewEl) {
    chartViewEl.style.overflow = 'hidden';
    chartViewEl.style.height = '100%';
  }
  splitPane.overflow = 'hidden';
  splitPane.display = 'flex';
  splitPane.position = 'absolute';
  (document.getElementsByClassName('Pane1')[0] as HTMLElement).style.height =
    'auto';
  (document.getElementsByClassName(
    'Pane2'
  )[0] as HTMLElement).style.height = `${height}px`;
  (document.getElementsByClassName('Resizer')[0] as HTMLElement).style.display =
    'block';
  (document.getElementsByClassName(
    'PageLayout'
  )[0] as HTMLElement).style.height = '100vh';
  return 0;
};

export const downloadImage = (
  image: string | undefined,
  chartName: string | undefined
) => {
  if (!image) {
    return;
  }
  const a = document.createElement('a');
  a.href = image;
  a.download = `${chartName}.png`;
  a.click();
};
