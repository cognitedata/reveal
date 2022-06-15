import { rest } from 'msw';
import sidecar from 'utils/sidecar';
import { MSWRequest } from 'utils/test';

export const mockCreatedTime = new Date();

const mockShopDatapoints = [
  {
    timestamp: 1654034400000,
    value: -2.66,
  },
  {
    timestamp: 1654038000000,
    value: -2.66,
  },
  {
    timestamp: 1654041600000,
    value: -2.66,
  },
  {
    timestamp: 1654045200000,
    value: -2.66,
  },
  {
    timestamp: 1654048800000,
    value: -2.66,
  },
  {
    timestamp: 1654052400000,
    value: -2.66,
  },
  {
    timestamp: 1654056000000,
    value: -3.05,
  },
  {
    timestamp: 1654059600000,
    value: -27.26,
  },
  {
    timestamp: 1654063200000,
    value: -122.53,
  },
  {
    timestamp: 1654066800000,
    value: -122.48,
  },
  {
    timestamp: 1654070400000,
    value: -122.41,
  },
  {
    timestamp: 1654074000000,
    value: -103.12,
  },
  {
    timestamp: 1654077600000,
    value: -36.1,
  },
  {
    timestamp: 1654081200000,
    value: -27.8,
  },
  {
    timestamp: 1654084800000,
    value: -25.67,
  },
  {
    timestamp: 1654088400000,
    value: -25.64,
  },
  {
    timestamp: 1654092000000,
    value: -25.6,
  },
  {
    timestamp: 1654095600000,
    value: -36.08,
  },
  {
    timestamp: 1654099200000,
    value: -34.44,
  },
  {
    timestamp: 1654102800000,
    value: -33.79,
  },
  {
    timestamp: 1654106400000,
    value: -11.34,
  },
  {
    timestamp: 1654110000000,
    value: -3.03,
  },
  {
    timestamp: 1654113600000,
    value: -2.82,
  },
  {
    timestamp: 1654117200000,
    value: -2.65,
  },
];

const mockShopData = [
  {
    id: 1,
    externalId: 'scenario1_externalId',
    isString: false,
    isStep: true,
    unit: 'MWh',
    datapoints: mockShopDatapoints,
  },
  {
    id: 2,
    externalId: 'scenario2_externalId',
    isString: false,
    isStep: true,
    unit: 'MWh',
    datapoints: mockShopDatapoints,
  },
];

export const getMockTimeseriesData = (): MSWRequest => {
  const url = `${sidecar.cdfApiBaseUrl}/api/v1/projects/test-project/timeseries/data/list`;

  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(
      ctx.json({
        items: mockShopData,
      })
    );
  });
};
