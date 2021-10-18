import get from 'lodash/get';
import { Data } from 'plotly.js';

import { Metadata } from '@cognite/sdk';

import { MEASUREMENT_CURVE_CONFIG } from 'modules/wellSearch/constants';
import { Measurement, MeasurementType } from 'modules/wellSearch/types';
import { convertPressure } from 'modules/wellSearch/utils/common';
import { WellConfig } from 'tenants/types';

type ColumnsMetadata = {
  [key: string]: Metadata;
};

type OtherDataType = 'fit' | 'lot';

const ANGLE_CURVES_UNIT = 'deg';

export const formatChartData = (
  measurements: Measurement[],
  geomechanicsCurves: string[],
  ppfgCurves: string[],
  otherTypes: string[],
  reference: string,
  pressureUnit: string,
  config?: WellConfig
) => {
  const chartData: Data[] = [];
  const processedCurves: string[] = [];

  measurements.forEach((measurement) => {
    const { rows, metadata } = measurement;

    if (!metadata) return;

    let enableCurves: string[] = [];

    let detailCardTitle = '';

    const dataType = metadata.dataType as MeasurementType;

    if (config && otherTypes.includes(dataType.toUpperCase())) {
      const convertedData = convertOtherDataToPlotly(
        measurement,
        dataType as OtherDataType,
        config,
        pressureUnit
      );
      if (convertedData) chartData.push(convertedData);
      return;
    }

    if (!rows || !rows.length) return;

    if (dataType === 'geomechanic') {
      enableCurves = geomechanicsCurves;
      detailCardTitle = 'Geomechanics';
    } else if (dataType === 'ppfg') {
      enableCurves = ppfgCurves;
      detailCardTitle = 'PPFG';
    }

    const columnList = rows[0].columns.map((column) => column.name as string);

    const referenceColIndex = columnList.indexOf(reference);

    if (
      measurement &&
      measurement.columns.length > 0 &&
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
      const tvdUnit = columnsMetadata[reference].unit || '';

      // Push curve data in to the chart data object
      enableCurves.forEach((curveName: string) => {
        const curveDescription = `${curveName} (${detailCardTitle})`;

        if (processedCurves.includes(curveDescription)) return;

        processedCurves.push(curveDescription);

        const lineConfig = MEASUREMENT_CURVE_CONFIG[dataType][curveName];

        const columnIndex = columnList.indexOf(curveName);

        if (columnIndex > -1 && lineConfig) {
          // Get column data unit
          const xUnit = columnsMetadata[curveName].unit || '';

          const isAngleCurve = xUnit === ANGLE_CURVES_UNIT;
          const x: number[] = [];
          const y: number[] = [];
          rows.forEach((geomechanicRow) => {
            y.push(geomechanicRow[referenceColIndex] as number);
            if (isAngleCurve) {
              x.push(geomechanicRow[columnIndex] as number);
            } else {
              x.push(
                convertPressure(
                  geomechanicRow[columnIndex] as number,
                  xUnit,
                  geomechanicRow[referenceColIndex] as number,
                  tvdUnit,
                  pressureUnit
                )
              );
            }
          });
          const curveData: Data = {
            ...lineConfig,
            x,
            y,
            type: 'scatter',
            mode: 'lines',
            name: curveName,
            customdata: [curveDescription],
          };

          if (isAngleCurve) {
            curveData.xaxis = 'x2';
          }

          chartData.push(curveData);
        }
      });
    }
  });

  return chartData;
};

// This is used to format sequence data according to the plotly chart data patten
export const convertOtherDataToPlotly = (
  sequence: Measurement,
  type: OtherDataType,
  config: WellConfig,
  pressureUnit: string
): Data | null => {
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
    ...MEASUREMENT_CURVE_CONFIG[type].default,
    x: [
      convertPressure(xVal, currentPressureUnit, yVal, tvdUnit, pressureUnit),
    ],
    y: [yVal],
    type: 'scatter',
    mode: 'markers',
    name,
    customdata: [name],
  };
};
