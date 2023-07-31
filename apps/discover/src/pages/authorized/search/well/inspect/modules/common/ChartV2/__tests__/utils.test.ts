import {
  findVisibleYTicksValues,
  getChartDisplayValues,
  getChartPositionValues,
} from '../utils';

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
  describe('getChartDisplayValues', () => {
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
  });

  describe('getChartPositionValues', () => {
    test('Should return mose position', () => {
      expect(getChartPositionValues(plotMouseEvent)).toEqual({
        left: 158,
        show: true,
        top: 20,
        width: 342,
      });
    });
  });

  describe('findVisibleYTicksValues', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    test('Should return visible y ticks values in range', () => {
      document.body.innerHTML =
        '<div id="test"><g class="yaxislayer-above"><g class="ytick"><text text-anchor="end" x="59" y="4.199999999999999" data-unformatted="3030" data-math="N" transform="translate(0,500.6)" style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;">3030</text></g><g class="ytick"><text text-anchor="end" x="59" y="4.199999999999999" data-unformatted="3025" data-math="N" style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;" transform="translate(0,430.92)">3025</text></g><g class="ytick"><text text-anchor="end" x="59" y="4.199999999999999" data-unformatted="3020" data-math="N" style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;" transform="translate(0,361.23)">3020</text></g><g class="ytick"><text text-anchor="end" x="59" y="4.199999999999999" data-unformatted="3015" data-math="N" style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;" transform="translate(0,291.55)">3015</text></g><g class="ytick"><text text-anchor="end" x="59" y="4.199999999999999" data-unformatted="3010" data-math="N" style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;" transform="translate(0,221.87)">3010</text></g><g class="ytick"><text text-anchor="end" x="59" y="4.199999999999999" data-unformatted="3005" data-math="N" style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;" transform="translate(0,152.18)">3005</text></g><g class="ytick"><text text-anchor="end" x="59" y="4.199999999999999" data-unformatted="3000" data-math="N" style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;" transform="translate(0,82.5)">3000</text></g></g></div>';

      const element = document.getElementById('test');

      const result = findVisibleYTicksValues(element!);

      expect(result).toEqual([3000, 3005, 3010, 3015, 3020, 3025, 3030]);
    });

    test('Should return empty list when no data found', () => {
      document.body.innerHTML =
        '<div id="test"><g class="yaxislayer-above"></g></div>';

      const element = document.getElementById('test');

      const result = findVisibleYTicksValues(element!);

      expect(result).toEqual([]);
    });
  });
});

// To do in the future, 'DOMMatrix' is not defined, thus not possible
// to create fake hmtl like above. Look into including the
// 'jest-canvas-mock' package to get this work
describe('calculateYTicksGap', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test.todo('Should find the gap between two Y axis');
});
