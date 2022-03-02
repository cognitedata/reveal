import flatten from 'lodash/flatten';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import { PlotData } from 'plotly.js';
import { convertPressure, unsafeChangeUnitTo } from 'utils/units';

import {
  DepthMeasurementColumn,
  DepthMeasurementData,
  DepthMeasurementDataColumn,
  DistanceUnitEnum,
} from '@cognite/sdk-wells-v3';

import { PressureUnit } from 'constants/units';
import {
  MEASUREMENT_CURVE_CONFIG_V3 as MEASUREMENT_CURVE_CONFIG,
  MEASUREMENT_EXTERNAL_ID_CONFIG,
} from 'modules/wellSearch/constants';
import {
  MeasurementV3 as Measurement,
  MeasurementChartDataV3 as MeasurementChartData,
  Wellbore,
  MeasurementTypeV3 as MeasurementType,
  WdlMeasurementType,
  GeoPpfgFilterTypes,
} from 'modules/wellSearch/types';

const ANGLE_CURVES_UNIT = 'deg';
const CHART_BREAK_POINTS = [0, -9999];

export const formatChartData = (
  measurements: Measurement[],
  geomechanicsCurves: DepthMeasurementColumn[], // currently enabled geomechanics curves from filters
  ppfgCurves: DepthMeasurementColumn[], // currently enabled ppfg curves from filters
  otherTypes: DepthMeasurementColumn[], // currently enabled other curves from filters
  userPreferedPressureUnit: PressureUnit,
  userPreferedDepthMeasurementUnit: string
) => {
  const processedCurves: string[] = [];

  return measurements.reduce((chartData, measurement) => {
    const { data } = measurement;

    // No rows
    if (isUndefined(data)) return [];

    if (!measurement || isEmpty(measurement.columns)) return [];

    const tvdUnit = measurement.depthColumn.unit.unit;

    const chartsOfCurrentMeasurement = data.columns.reduce(
      (chartData, column) => {
        const chartsOfCurrentColumn = mapMeasurementToPlotly(
          column,
          data,
          geomechanicsCurves,
          ppfgCurves,
          otherTypes,
          tvdUnit,
          userPreferedPressureUnit,
          userPreferedDepthMeasurementUnit,
          processedCurves
        );
        return [...chartData, ...chartsOfCurrentColumn];
      },
      [] as MeasurementChartData[]
    );
    return [...chartData, ...chartsOfCurrentMeasurement];
  }, [] as MeasurementChartData[]);
};

export const mapMeasurementToPlotly = (
  column: DepthMeasurementDataColumn,
  data: DepthMeasurementData,
  geomechanicsCurves: DepthMeasurementColumn[], // currently enabled geomechanics curves from filters
  ppfgCurves: DepthMeasurementColumn[], // currently enabled ppfg curves from filters
  otherTypes: DepthMeasurementColumn[], // currently enabled other curves from filters
  tvdUnit: DistanceUnitEnum,
  userPreferedPressureUnit: PressureUnit,
  userPreferedDepthMeasurementUnit: string,
  processedCurves: string[] = []
): MeasurementChartData[] => {
  const measurementType = resolveMeasurementType(column.measurementType);

  if (isUndefined(measurementType)) return [];

  const filterType = getFilterType(measurementType);

  if (isEmpty(ppfgCurves) && isEmpty(geomechanicsCurves) && isEmpty(otherTypes))
    return [];

  const { detailCardTitle, enabledCurves } =
    getEnabledCurvesAndCardTitleForFilterType(
      filterType,
      geomechanicsCurves,
      ppfgCurves,
      otherTypes
    );

  return enabledCurves.reduce((chartDataList, enabledCurve) => {
    const chartDataListForCurrentCurve = mapCurveToPlotly(
      enabledCurve,
      processedCurves,
      detailCardTitle,
      data,
      tvdUnit,
      userPreferedDepthMeasurementUnit,
      userPreferedPressureUnit,
      measurementType
    );

    if (isUndefined(chartDataListForCurrentCurve)) {
      return chartDataList;
    }

    return [...chartDataList, ...chartDataListForCurrentCurve];
  }, [] as MeasurementChartData[]);
};

const getEnabledCurvesAndCardTitleForFilterType = (
  filterType: GeoPpfgFilterTypes,
  geomechanicsCurves: DepthMeasurementColumn[],
  ppfgCurves: DepthMeasurementColumn[],
  otherTypes: DepthMeasurementColumn[]
) => {
  let detailCardTitle = '';
  let enabledCurves: DepthMeasurementColumn[] = [];

  if (filterType === GeoPpfgFilterTypes.GEOMECHANNICS) {
    enabledCurves = geomechanicsCurves;
    detailCardTitle = 'Geomechanics';
  } else if (filterType === GeoPpfgFilterTypes.PPFG) {
    enabledCurves = ppfgCurves;
    detailCardTitle = 'PPFG';
  } else {
    enabledCurves = otherTypes;
    detailCardTitle = 'Other';
  }
  return {
    detailCardTitle,
    enabledCurves,
  };
};

/**
 *
 * Maps a curve ( column of sequence ) to plotly to generate the graph
 * Basically loop thought row data can map them in to x, y coordinates
 * incude other configuration like colors etc
 *
 * @param curve Which column we are processing
 * @param processedCurves
 * @param detailCardTitle
 * @param depthMeasurementData Object with curve(column) data
 * @param tvdUnit y axis unit ( a depth unit )
 * @param userPreferedDepthMeasurementUnit Depth unit to which data value should be converted to
 * @param userPreferedPressureUnit Pressure unit to which data value should be converted to
 * @param measurementType Measurement type Geo, Ppfg, lot or fit
 * @returns
 */
export const mapCurveToPlotly = (
  depthMeasurementColumn: DepthMeasurementColumn,
  processedCurves: string[],
  detailCardTitle: string,
  depthMeasurementData: DepthMeasurementData,
  tvdUnit: DistanceUnitEnum,
  userPreferedDepthMeasurementUnit: string,
  userPreferedPressureUnit: PressureUnit,
  measurementType: MeasurementType
): MeasurementChartData[] => {
  const chartData: MeasurementChartData[] = [];
  const curveDescription = `${depthMeasurementColumn.columnExternalId} (${detailCardTitle})`;

  if (processedCurves.includes(curveDescription)) return [];

  /**
   * We don't recognize this measurement type
   * Just a precausion, we fetch by measurement type
   */
  if (isUndefined(measurementType)) return [];

  /**
   * Ploty config for the curve ( color, line etc)
   */
  const lineConfig =
    (MEASUREMENT_CURVE_CONFIG[measurementType] || {})[
      depthMeasurementColumn.columnExternalId
    ] || MEASUREMENT_CURVE_CONFIG[measurementType]?.default;

  /**
   * This is used to pluck respective value from row data.
   */
  const columnIndex = depthMeasurementData.columns.findIndex(
    (column) => column.externalId === depthMeasurementColumn.columnExternalId
  );

  if (isUndefined(lineConfig) || columnIndex < 0) return [];

  processedCurves.push(curveDescription);

  // Get column data unit
  const xUnit = depthMeasurementData.columns[columnIndex].unit || '';

  const isAngleCurve = xUnit === ANGLE_CURVES_UNIT;

  let x: number[] = [];
  let y: number[] = [];

  depthMeasurementData.rows.forEach((depthMeasurementRow) => {
    const yValue = depthMeasurementRow.depth as number;
    const xValue = depthMeasurementRow.values[columnIndex] as number;

    /**
     * When then is a breaking point ( coordinates are not smooth but wayward) we break the chart (line)
     * from that point and draw a another one from the next coordinate
     */
    if (
      CHART_BREAK_POINTS.includes(xValue) ||
      CHART_BREAK_POINTS.includes(yValue)
    ) {
      // If this is the first value it should be ok
      if (isEmpty(x)) return;
      // Consider already collected values list as a one line and clear the arrays
      pushCurveToChart(
        chartData,
        measurementType,
        lineConfig,
        isAngleCurve,
        depthMeasurementColumn.columnExternalId,
        curveDescription,
        x,
        y
      );
      // eslint-disable-next-line no-param-reassign
      x = [];
      // eslint-disable-next-line no-param-reassign
      y = [];
      /**
       * Skipping the breaking point coordinates
       */
      return;
    }

    y.push(
      unsafeChangeUnitTo(yValue, tvdUnit, userPreferedDepthMeasurementUnit) ||
        yValue
    );
    if (isAngleCurve) {
      x.push(xValue);
    } else {
      x.push(
        convertPressure(
          xValue,
          xUnit,
          yValue,
          tvdUnit,
          userPreferedPressureUnit
        )
      );
    }
  });

  pushCurveToChart(
    chartData,
    measurementType,
    lineConfig,
    isAngleCurve,
    depthMeasurementColumn.columnExternalId,
    curveDescription,
    x,
    y
  );

  return chartData;
};

export const pushCurveToChart = (
  chartData: MeasurementChartData[],
  measurementType: MeasurementType,
  lineConfig: Partial<PlotData>,
  isAngleCurve: boolean,
  curveName: string,
  curveDescription: string,
  x: number[],
  y: number[]
) => {
  const curveData: MeasurementChartData = {
    ...lineConfig,
    x,
    y,
    type: 'scatter',
    mode: 'lines',
    name: curveName,
    customdata: [curveDescription],
    xaxis: isAngleCurve ? 'x2' : undefined,
    measurementType,
  };
  if (x.length > 2) {
    chartData.push(curveData);
  }
};

export const mapToCurveCentric = (
  data: MeasurementChartData[],
  wellbore: Wellbore
) =>
  data.map((row) => ({
    ...row,
    customdata: [
      wellbore.metadata?.wellName || '',
      `${wellbore.description} ${wellbore.name}`,
    ],
    ...(row.marker
      ? {
          marker: {
            ...row.marker,
            color: wellbore.metadata?.color,
            line: {
              color: wellbore.metadata?.color,
            },
          },
        }
      : {
          line: {
            ...row.line,
            color: wellbore.metadata?.color,
          },
        }),
  }));

export const mapToCompareView = (
  data: {
    wellbore: Wellbore;
    chartData: MeasurementChartData[];
  }[]
) =>
  groupBy(
    flatten(
      data.map(({ wellbore, chartData }) =>
        chartData.map((row) => {
          const wellboreDescription = `${wellbore.description} ${wellbore.name}`;
          const curveDescription = row.customdata
            ? (row.customdata[0] as string)
            : '';
          const chart: MeasurementChartData = {
            ...row,
            xaxis: !row.xaxis ? 'x' : row.xaxis,
            customdata: [curveDescription, wellboreDescription],
          };
          return chart;
        })
      )
    ),
    'xaxis'
  );

export const filterByChartType = (
  charts: MeasurementChartData[],
  types: string[]
) => charts.filter((chart) => types.includes(chart.measurementType));

export const filterByMainChartType = (charts: MeasurementChartData[]) =>
  charts.filter((chart) =>
    [MeasurementType.GEOMECHANNICS, MeasurementType.PPFG].find(
      (measurementType) => {
        return measurementType === chart.measurementType;
      }
    )
  );

export const resolveMeasurementType = (measurementType: string) =>
  Object.keys(MEASUREMENT_EXTERNAL_ID_CONFIG).find((measurementTypeOfCurve) =>
    Object.values(
      MEASUREMENT_EXTERNAL_ID_CONFIG[measurementTypeOfCurve as MeasurementType]
    ).find((type) => type === (measurementType as WdlMeasurementType))
  ) as MeasurementType;

export const getFilterType = (measurementType: MeasurementType) => {
  switch (measurementType) {
    case MeasurementType.GEOMECHANNICS:
      return GeoPpfgFilterTypes.GEOMECHANNICS;
    case MeasurementType.PPFG:
      return GeoPpfgFilterTypes.PPFG;
    default:
      return GeoPpfgFilterTypes.OTHER;
  }
};

export const getSelectedWellboresTitle = (count: number) =>
  `${count} ${count > 1 ? 'wellbores' : 'wellbore'} selected`;

export const getSelectedWellsTitle = (count: number) =>
  `From ${count} ${count > 1 ? 'wells' : 'well'}`;
