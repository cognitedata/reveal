import { Timeseries } from '@cognite/sdk';
import { AxisUpdate } from 'components/PlotlyChart';
import { v4 as uuidv4 } from 'uuid';
import {
  Chart,
  ChartSettings,
  ChartTimeSeries,
  ChartWorkflow,
  SourceCollectionData,
  UserInfo,
} from 'models/chart/types';
import { getEntryColor } from 'utils/colors';
import { convertTsToWorkFlow } from 'utils/timeseries';
import dayjs from 'dayjs';

export function duplicate(chart: Chart, login: UserInfo): Chart {
  const id = uuidv4();
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
    sourceCollection: chart.sourceCollection?.filter((t) => t.id !== collId),
  };
}

function addItem<T extends ChartWorkflow | ChartTimeSeries>(
  chart: Chart,
  collectionType: 'timeSeriesCollection' | 'workflowCollection',
  item: T
): Chart {
  const type =
    collectionType === 'timeSeriesCollection' ? 'timeseries' : 'workflow';
  return {
    ...chart,
    [collectionType]: [...(chart[collectionType] || []), { ...item, type }],
    sourceCollection: [
      { id: item.id, type },
      ...(chart.sourceCollection || []),
    ],
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
      id: uuidv4(),
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
    id: uuidv4(),
    name: ts.name || ts.externalId || ts.id.toString(),
    tsId: ts.id,
    tsExternalId: ts.externalId,
    unit: ts.unit || '',
    type: 'timeseries',
    originalUnit: ts.unit || '',
    preferredUnit: ts.unit || '',
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

export function updateSourceAxisForChart(
  chart: Chart,
  { x, y }: { x: string[]; y: AxisUpdate[] }
): Chart {
  const updatedChart = {
    ...chart,
    ...(x.length === 2
      ? {
          dateFrom: `${x[0]}`,
          dateTo: `${x[1]}`,
        }
      : {}),
    ...(y.length > 0
      ? {
          timeSeriesCollection: chart.timeSeriesCollection?.map((ts) => {
            const correspondingUpdate = y.find((update) => update.id === ts.id);
            return correspondingUpdate
              ? { ...ts, range: correspondingUpdate.range }
              : ts;
          }),
          workflowCollection: chart.workflowCollection?.map((wf) => {
            const correspondingUpdate = y.find((update) => update.id === wf.id);
            return correspondingUpdate
              ? { ...wf, range: correspondingUpdate.range }
              : wf;
          }),
        }
      : {}),
  };

  return updatedChart;
}

export const updateChartSettings = (
  chart: Chart,
  diff: Partial<ChartSettings>
): Chart => {
  return {
    ...chart,
    settings: { ...chart.settings, ...diff },
  };
};

/**
 * function updateAllRowsVisibility
 * @param chart Charts object
 * @param showAllChartRows Boolean value to maintain charts rows visibility
 * @returns Updated charts object with all rows of both collection [Timeseries/Workflow] enable status to be uniform.
 */
export const updateAllRowsVisibility = (
  chart: Chart,
  showAllChartRows: boolean
) => {
  return {
    ...chart,
    timeSeriesCollection: chart.timeSeriesCollection?.map((ts) => ({
      ...ts,
      enabled: showAllChartRows,
    })),
    workflowCollection: chart.workflowCollection?.map((ts) => ({
      ...ts,
      enabled: showAllChartRows,
    })),
  };
};

export const updateChartDateRange = (
  chart: Chart,
  dateFrom: Date | string | undefined,
  dateTo: Date | string | undefined
) => {
  const requestedDateFrom = dayjs(dateFrom || chart.dateFrom!);
  const requestedDateTo = dayjs(dateTo || chart.dateTo!);
  const isFromAfterTo = requestedDateFrom.isAfter(requestedDateTo);
  const newDateFrom = isFromAfterTo ? requestedDateTo : requestedDateFrom;
  const newDateTo = isFromAfterTo ? requestedDateFrom : requestedDateTo;

  return {
    ...chart,
    dateFrom: newDateFrom.toJSON(),
    dateTo: newDateTo.toJSON(),
  };
};
