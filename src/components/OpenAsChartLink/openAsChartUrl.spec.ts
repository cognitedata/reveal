import { openAsChartURL } from './openAsChartUrl';

describe('openAsChartUrl', () => {
  it('handles valid input', () => {
    expect(
      openAsChartURL({
        startDate: new Date(1649094928552),
        endDate: new Date(1649094928552),
        timeseriesIds: [1, 2, 3],
        project: 'fusion',
      })
    ).toBe(
      'https://charts.cogniteapp.com/fusion/?startTime=1649094928552&endTime=1649094928552&timeseriesIds=1%2C2%2C3'
    );
    expect(
      openAsChartURL({
        startDate: new Date(1603289653055),
        endDate: new Date(1622038604539),
        timeseriesIds: [227504161959307, 1822622045765216, 1199025179480785],
        timeseriesExternalIds: ['LOR_ARENDAL_WELL_21_PRESSURE_MEASUREMENT_0'],
        project: 'fusion',
        chartName: 'Custom chart name',
      })
    ).toBe(
      'https://charts.cogniteapp.com/fusion/?startTime=1603289653055&endTime=1622038604539&timeseriesIds=227504161959307%2C1822622045765216%2C1199025179480785&timeserieExternalIds=LOR_ARENDAL_WELL_21_PRESSURE_MEASUREMENT_0&chartName=Custom+chart+name'
    );
  });
  it('handles invalid input', () => {
    expect(() =>
      // @ts-expect-error
      openAsChartURL({
        startDate: new Date(1603289653055),
        endDate: new Date(1622038604539),
        project: 'fusion',
        chartName: 'Custom chart name',
      })
    ).toThrow();
  });
});
