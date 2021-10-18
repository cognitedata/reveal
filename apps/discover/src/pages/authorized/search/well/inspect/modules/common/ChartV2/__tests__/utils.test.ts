import { getChartDisplayValues, getChartPositionValues } from '../utils';

const plotMouseEvent = {
  points: [
    {
      x: 1,
      y: 2,
      yaxis: { title: { text: 'Y Axis' } },
      xaxis: { title: { text: 'X Axis' } },
      data: {
        customdata: ['Test Header'],
        line: {},
        marker: {},
      },
    },
  ],
  event: {
    offsetX: 500,
    offsetY: 10,
  },
};

describe('Chart utils', () => {
  test('Should return chart display values', () => {
    expect(getChartDisplayValues(plotMouseEvent)).toEqual({
      customdata: ['Test Header'],
      line: {},
      marker: {},
      x: 1,
      xTitle: 'X Axis',
      y: 2,
      yTitle: 'Y Axis',
    });
  });

  test('Should return mose position', () => {
    expect(getChartPositionValues(plotMouseEvent)).toEqual({
      left: 158,
      show: true,
      top: 10,
      width: 342,
    });
  });
});
