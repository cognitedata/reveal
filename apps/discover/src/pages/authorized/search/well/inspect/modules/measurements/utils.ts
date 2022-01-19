import flatten from 'lodash/flatten';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import { PlotData } from 'plotly.js';
import { convertPressure, changeUnitTo } from 'utils/units';

import { ProjectConfigWells } from '@cognite/discover-api-types';
import { Metadata } from '@cognite/sdk';

import { MEASUREMENT_CURVE_CONFIG } from 'modules/wellSearch/constants';
import {
  Measurement,
  MeasurementChartData,
  MeasurementType,
  Wellbore,
} from 'modules/wellSearch/types';

type ColumnsMetadata = {
  [key: string]: Metadata;
};

type OtherDataType = 'fit' | 'lot';

const ANGLE_CURVES_UNIT = 'deg';
const DEFAULT_REFERENCE_UNIT = 'ft';
const CHART_BREAK_POINTS = [0, -9999];

export const formatChartData = (
  measurements: Measurement[],
  geomechanicsCurves: string[],
  ppfgCurves: string[],
  otherTypes: string[],
  reference: string,
  pressureUnit: string,
  referenceUnit: string,
  config?: ProjectConfigWells
) => {
  const chartData: MeasurementChartData[] = [];
  const processedCurves: string[] = [];

  measurements.forEach((measurement) => {
    const { rows, metadata } = measurement;

    if (!metadata) return;

    let enableCurves: string[] = [];

    let detailCardTitle = '';

    const dataTypeStr = metadata.dataType as keyof typeof MeasurementType;

    const dataType = MeasurementType[dataTypeStr];

    /**
     * Process other data ( eg FIT or LOT )
     */
    if (config && otherTypes.includes(dataTypeStr.toUpperCase())) {
      const convertedData = convertOtherDataToPlotly(
        measurement,
        dataTypeStr as OtherDataType,
        config,
        pressureUnit,
        referenceUnit
      );
      if (convertedData)
        chartData.push({
          ...convertedData,
          measurementType: dataType,
        });
      return;
    }

    if (!rows || !rows.length) return;

    if (dataType === MeasurementType.geomechanic) {
      enableCurves = geomechanicsCurves;
      detailCardTitle = 'Geomechanics';
    } else if (dataType === MeasurementType.ppfg) {
      enableCurves = ppfgCurves;
      detailCardTitle = 'PPFG';
    }

    const columnList = rows[0].columns.map((column) => column.name as string);

    const referenceColIndex = columnList.indexOf(reference);

    if (
      measurement &&
      !isEmpty(measurement.columns) &&
      referenceColIndex > -1
    ) {
      const columnsMetadata = measurement.columns.reduce(
        (metadataMap, column) => ({
          ...metadataMap,
          [column.name as string]: column.metadata || {},
        }),
        {} as ColumnsMetadata
      );

      // Update y axis name with unit
      const tvdUnit = columnsMetadata[reference].unit || DEFAULT_REFERENCE_UNIT;
      // Push curve data in to the chart data object
      enableCurves.forEach((curveName: string) => {
        const curveDescription = `${curveName} (${detailCardTitle})`;

        if (processedCurves.includes(curveDescription)) return;

        const lineConfig = MEASUREMENT_CURVE_CONFIG[dataType][curveName];

        const columnIndex = columnList.indexOf(curveName);

        const curveExistInSequenceColumns = columnList.includes(curveName);

        if (!curveExistInSequenceColumns || isUndefined(lineConfig)) return;

        processedCurves.push(curveDescription);

        // Get column data unit
        const xUnit = columnsMetadata[curveName].unit || '';

        const isAngleCurve = xUnit === ANGLE_CURVES_UNIT;
        let x: number[] = [];
        let y: number[] = [];
        rows.forEach((measurementRow) => {
          const yValue = measurementRow[referenceColIndex] as number;
          const xValue = measurementRow[columnIndex] as number;
          /**
           * When then is a breaking point ( coordinates are not smooth but wayward) we breat the chart (line)
           * from that point and draw a another one from the next coordinate
           */
          if (
            CHART_BREAK_POINTS.includes(xValue) ||
            CHART_BREAK_POINTS.includes(yValue)
          ) {
            if (isEmpty(x)) return;
            // Consider already collected values list as a one line and clear the arrays
            pushCorveToChart(
              chartData,
              dataType,
              lineConfig,
              isAngleCurve,
              curveName,
              curveDescription,
              x,
              y
            );
            x = [];
            y = [];
            /**
             * Skipping the breaking point coordinates
             */
            return;
          }
          y.push(changeUnitTo(yValue, tvdUnit, referenceUnit) || yValue);
          if (isAngleCurve) {
            x.push(xValue);
          } else {
            x.push(
              convertPressure(xValue, xUnit, yValue, tvdUnit, pressureUnit)
            );
          }
        });

        pushCorveToChart(
          chartData,
          dataType,
          lineConfig,
          isAngleCurve,
          curveName,
          curveDescription,
          x,
          y
        );
      });
    }
  });

  return chartData;
};

// This is used to format sequence data according to the plotly chart data patten
export const convertOtherDataToPlotly = (
  sequence: Measurement,
  type: OtherDataType,
  config: ProjectConfigWells,
  pressureUnit: string,
  referenceUnit: string
): Partial<PlotData> | null => {
  const requiredFields = ['pressure', 'tvd', 'tvdUnit', 'pressureUnit'];

  const fieldInfo = config[type]?.fieldInfo || {};

  const isRequiredFieldsAvailable =
    requiredFields.filter((requiredField) =>
      Object.keys(fieldInfo).includes(requiredField)
    ).length !== requiredFields.length;

  if (isRequiredFieldsAvailable) {
    return null;
  }

  const xVal = Number(get(sequence, fieldInfo.pressure, 0));
  const yVal = Number(get(sequence, fieldInfo.tvd, 0));
  const tvdUnit = get(sequence, fieldInfo.tvdUnit);
  const currentPressureUnit = get(sequence, fieldInfo.pressureUnit);

  const name = `${type.toUpperCase()} - ${sequence.name} ${
    sequence.description
  }`;

  return {
    ...MEASUREMENT_CURVE_CONFIG[MeasurementType[type]].default,
    x: [
      convertPressure(xVal, currentPressureUnit, yVal, tvdUnit, pressureUnit),
    ],
    y: [changeUnitTo(yVal, tvdUnit, referenceUnit) || yVal],
    type: 'scatter',
    mode: 'markers',
    name,
    customdata: [name],
  };
};

const pushCorveToChart = (
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
  types: MeasurementType[]
) => charts.filter((chart) => types.includes(chart.measurementType));

export const filterByMainChartType = (charts: MeasurementChartData[]) =>
  charts.filter((chart) =>
    [MeasurementType.geomechanic, MeasurementType.ppfg].includes(
      chart.measurementType
    )
  );

export const getSelectedWellboresTitle = (count: number) =>
  `${count} ${count > 1 ? 'wellbores' : 'wellbore'} selected`;

export const getSelectedWellsTitle = (count: number) =>
  `From ${count} ${count > 1 ? 'wells' : 'well'}`;
