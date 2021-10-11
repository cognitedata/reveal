import React from 'react';
import { useTranslation } from 'react-i18next';

import head from 'lodash/head';
import { Data } from 'plotly.js';

import { SequenceRow, SequenceData } from 'modules/wellSearch/types';
import { convertToPpg } from 'modules/wellSearch/utils/common';

import { EMPTY_CHART_DATA_MESSAGE } from '../../../constants';
import Chart from '../../common/Chart/Chart';
import { MessageWrapper } from '../../common/elements';

import { ChartHolder } from './elements';

type Props = {
  geomechanicData: SequenceData;
};

const DISPLAY_CURVES = [
  'UCS',
  'COLLAPSE_MAX_PPG',
  'INTFRIC_ANGLE',
  'SHMAX_PPG',
  'SHMIN_PPG',
  'UCS_PRE',
  'COLLAPSE_ML_PPG',
];

const TVD_COLUMN_NAME = 'TVDKB';

export const GeomechanicViewer: React.FC<Props> = ({ geomechanicData }) => {
  const { t } = useTranslation('WellData');

  // This format sequence row data according to the chart data patten and set in the state
  const formatChartData = ({ sequence, rows }: SequenceData) => {
    const chartData: Data[] = [];
    let yAxisName = '';

    if (rows?.length === 0) {
      // return empty chart data
      return { chartData, yAxisName };
    }

    const columnList = (rows as SequenceRow[])[0].columns.map(
      (column) => column.name
    );

    const tvdColIndex = columnList.indexOf(TVD_COLUMN_NAME);

    if (sequence && sequence.columns.length > 0) {
      // Update y axis name with unit
      const tvdUnit = sequence.columns
        .filter((column) => column.name === TVD_COLUMN_NAME)
        .map((column) => column.metadata?.unit);
      if (tvdUnit.length > 0 && tvdUnit[0]) {
        yAxisName = `${TVD_COLUMN_NAME} (${tvdUnit[0]})`;
      }
      // Push curve data in to the chart data object
      DISPLAY_CURVES.forEach((curveName: string) => {
        const columnIndex = columnList.indexOf(curveName);
        if (columnIndex > -1 && tvdColIndex > -1) {
          // Get column data unit
          const xUnit = sequence.columns
            .filter((column) => column.name === curveName)
            .map((column) => (column.metadata ? column.metadata.unit : ''));

          const x = [] as number[];
          const y = [] as number[];
          (rows as SequenceRow[]).forEach((geomechanicRow) => {
            y.push(geomechanicRow[tvdColIndex] as number);
            if (curveName === 'INTFRIC_ANGLE') {
              x.push(geomechanicRow[columnIndex] as number);
            } else {
              x.push(
                convertToPpg(
                  geomechanicRow[columnIndex] as number,
                  head(xUnit) as string,
                  geomechanicRow[tvdColIndex] as number,
                  head(tvdUnit) || ''
                )
              );
            }
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
    return { chartData, yAxisName };
  };

  const geomechanicChartData = formatChartData(geomechanicData);

  return geomechanicChartData && geomechanicChartData.chartData.length > 0 ? (
    <ChartHolder>
      <Chart
        data={geomechanicChartData.chartData.filter(
          (curv) => curv.name === 'INTFRIC_ANGLE'
        )}
        axisNames={{
          x: 'Angle (deg)',
          y: geomechanicChartData.yAxisName,
        }}
        axisAutorange={{
          y: 'reversed',
        }}
        title="Intfric Angle"
        autosize
      />
      <Chart
        data={geomechanicChartData.chartData.filter(
          (curv) => curv.name !== 'INTFRIC_ANGLE'
        )}
        axisNames={{
          x: 'Pressure (ppg)',
          y: geomechanicChartData.yAxisName,
        }}
        axisAutorange={{
          y: 'reversed',
        }}
        title="Collapse Max, Collapse ML, SH Max, SH Min, UCS, UCS PRE"
        autosize
      />
    </ChartHolder>
  ) : (
    <MessageWrapper>{t(EMPTY_CHART_DATA_MESSAGE)}</MessageWrapper>
  );
};
