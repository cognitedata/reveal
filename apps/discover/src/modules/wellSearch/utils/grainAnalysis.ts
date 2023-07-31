import sortBy from 'lodash/sortBy';
import { Data } from 'plotly.js';

import { SequenceRow, SequenceData } from '../types';

// This is used to format sequence row data according to the plotly chart data patten
export const convertToPlotly = (
  sequenceDataList: SequenceData[],
  displayCurves: string[],
  yColumn: string
) => {
  const chartData: Data[] = [];
  sequenceDataList.forEach(({ sequence, rows }: SequenceData) => {
    if (rows?.length === 0) {
      return;
    }

    const columnList = (rows as SequenceRow[])[0].columns.map(
      (column) => column.name
    );

    const yIndex = columnList.indexOf(yColumn);

    if (sequence && sequence.columns.length > 0) {
      // Push curve data in to the chart data object
      displayCurves.forEach((curveName: string) => {
        const columnIndex = columnList.indexOf(curveName);
        if (columnIndex > -1 && yIndex > -1) {
          const x = [] as number[];
          const y = [] as number[];
          sortBy(rows as SequenceRow[], (row) => row[0]).forEach((row) => {
            y.push(row[yIndex] as number);
            x.push(row[columnIndex] as number);
          });
          const curveData = {
            x,
            y,
            type: 'scatter',
            mode: 'lines',
            name: curveName,
            hovertemplate: `%{y}`,
          };
          chartData.push(curveData as Data);
        }
      });
    }
  });

  return { chartData };
};
