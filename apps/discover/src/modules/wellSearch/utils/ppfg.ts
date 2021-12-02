import { Data } from 'plotly.js';

import { PPG } from 'constants/units';

import { SequenceRow, SequenceData } from '../types';

import { convertPressure } from './common';

// This is used to format sequence row data according to the plotly chart data patten
export const convertToPlotly = (
  sequenceDataList: SequenceData[],
  displayCurves: string[],
  yColumn: string,
  pressureUnit: string = PPG
) => {
  const chartData: Data[] = [];
  let xAxisName = '';
  let yAxisName = '';
  sequenceDataList.forEach(({ sequence, rows }: SequenceData) => {
    if (rows?.length === 0) {
      return;
    }

    const columnList = (rows as SequenceRow[])[0].columns.map(
      (column) => column.name
    );

    const tvdColIndex = columnList.indexOf(yColumn);

    if (sequence && sequence.columns.length > 0) {
      // Update y axis name with unit
      const tvdUnit = sequence.columns
        .filter((column) => column.name === yColumn)
        .map((column) => column.metadata?.unit);
      if (tvdUnit.length > 0 && tvdUnit[0]) {
        yAxisName = `${yColumn} (${tvdUnit[0]})`;
      }

      // Update x axis name with unit
      const xUnit = sequence.columns
        .filter((column) => displayCurves.includes(column.name as string))
        .map((column) => column.metadata?.unit);
      if (xUnit.length > 0 && xUnit[0]) {
        xAxisName = `Pressure (${pressureUnit})`;
      }

      // Push curve data in to the chart data object
      displayCurves.forEach((curveName: string) => {
        const columnIndex = columnList.indexOf(curveName);
        if (columnIndex > -1 && tvdColIndex > -1) {
          const x = [] as number[];
          const y = [] as number[];
          (rows as SequenceRow[]).forEach((ppfgRow) => {
            y.push(ppfgRow[tvdColIndex] as number);
            x.push(
              convertPressure(
                ppfgRow[columnIndex] as number,
                xUnit?.[0] as string,
                ppfgRow[tvdColIndex] as number,
                tvdUnit?.[0] || '',
                pressureUnit
              )
            );
          });

          const displayCurveName = sequence.metadata?.wellboreDescription
            ? `${curveName} (${sequence.metadata?.wellboreDescription})`
            : curveName;
          const curveData = {
            x,
            y,
            type: 'scatter',
            mode: 'lines',
            name: displayCurveName,
            hovertemplate: `%{y}`,
            showlegend: true,
          };
          chartData.push(curveData as Data);
        }
      });
    }
  });

  return { chartData, xAxisName, yAxisName };
};
