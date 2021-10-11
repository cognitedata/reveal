import { SequenceColumn } from '@cognite/sdk';

import { createdAndLastUpdatedTime } from '__test-utils/fixtures/log';
import { SequenceData, SequenceRow } from 'modules/wellSearch/types';

import { convertToPlotly } from '../grainAnalysis';

describe('grain analysis utils', () => {
  const columns: SequenceColumn[] = [
    {
      valueType: 'STRING',
      ...createdAndLastUpdatedTime,
      id: 1,
      name: 'ColumnA',
    },
    {
      valueType: 'STRING',
      ...createdAndLastUpdatedTime,
      id: 2,
      name: 'ColumnB',
    },
    {
      valueType: 'STRING',
      ...createdAndLastUpdatedTime,
      id: 3,
      name: 'ColumnY',
    },
  ];

  const sequenceDataList: SequenceData[] = [
    {
      rows: [new SequenceRow(0, [1, 2, 3, 4], columns)],
      sequence: {
        columns,
        id: 1,
        ...createdAndLastUpdatedTime,
      },
    },
  ];
  const displayCurves = ['ColumnA'];
  const yColumn = 'ColumnY';

  it('should convert to plotly data', () => {
    expect(convertToPlotly(sequenceDataList, displayCurves, yColumn)).toEqual({
      chartData: [
        {
          hovertemplate: '%{y}',
          mode: 'lines',
          name: 'ColumnA',
          type: 'scatter',
          x: [1],
          y: [3],
        },
      ],
    });
  });
});
