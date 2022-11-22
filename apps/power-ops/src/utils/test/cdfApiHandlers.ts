import { rest } from 'msw';
import sidecar from 'utils/sidecar';

interface RequestDefinition {
  method: keyof typeof rest;
  /** path without project */
  path: RegExp | string;
  response: any;
}

const requests: RequestDefinition[] = [
  {
    method: 'post',
    path: '/assets/byids',
    response: {
      items: [
        {
          createdTime: 1662548611062,
          lastUpdatedTime: 1668686269894,
          rootId: 7099100263855890,
          parentId: 7099100263855890,
          parentExternalId: 'power_ops',
          externalId: 'configurations',
          name: 'Configurations',
          description: 'Configurations used for PowerOps',
          dataSetId: 4272372867810023,
          metadata: {
            customer: 'cognite',
            organization_subdomain: 'cog-power-ops',
            shop_service_url:
              'https://shop-staging.az-inso-powerops.cognite.ai/submit-run',
            tenant_id: '431fcc8b-74b8-4171-b7c9-e6fab253913b',
          },
          id: 51176283998229,
        },
      ],
    },
  },
  {
    method: 'post',
    path: '/events/byids',
    response: {
      items: [
        {
          externalId:
            'POWEROPS_DAY_AHEAD_BID_MATRIX_CALCULATION_69f5262b-5d8e-40ca-9a81-d0a027230729',
          dataSetId: 4272372867810023,
          type: 'POWEROPS_DAY_AHEAD_BID_MATRIX_CALCULATION',
          metadata: {
            'bid:main_scenario_incremental_mapping_external_id':
              'SHOP_Fornebu_incremental_mapping_multi_scenario_2_NO2_scenario_1',
            'shop:endtime': '2021-05-30 22:00:00',
            processed: 'true',
            'shop:starttime': '2021-05-21 22:00:00',
            'bid:market_config_external_id':
              'market_configuration_nordpool_dayahead',
            'bid:bid_matrix_generator_config_external_id':
              'POWEROPS_bid_matrix_generator_config_multi_scenario_2_NO2',
            'bid:bid_process_configuration_name': 'multi_scenario_2_NO2',
            'bid:price_area': 'price_area_NO2',
            'bid:date': '2021-05-22',
            'shop:incremental_mapping_external_ids':
              '["SHOP_Fornebu_incremental_mapping_multi_scenario_2_NO2_scenario_1", "SHOP_Fornebu_incremental_mapping_multi_scenario_2_NO2_scenario_2"]',
          },
          id: 1788209531102136,
          lastUpdatedTime: 1668765331922,
          createdTime: 1668765330344,
        },
      ],
    },
  },
  {
    method: 'post',
    path: '/timeseries/data/list',
    response: {
      items: [
        {
          id: 3375631878231752,
          externalId:
            'SHOP_market.Dayahead.price_05ff786f-feec-4fc2-b2ae-e2887b329f49',
          isString: false,
          isStep: true,
          unit: 'EUR/MWh',
          datapoints: [
            { timestamp: 1621634400000, value: 35.604891061215476 },
            { timestamp: 1621638000000, value: 8.761160236260295 },
            { timestamp: 1621641600000, value: 0.9270393095273699 },
            { timestamp: 1621645200000, value: 0.22008443713184397 },
            { timestamp: 1621648800000, value: 0.052032403724683686 },
            { timestamp: 1621652400000, value: 0.04946435480782157 },
            { timestamp: 1621656000000, value: 0.1770619692303287 },
            { timestamp: 1621659600000, value: 0.6059625835293173 },
            { timestamp: 1621663200000, value: 1.4285841191132627 },
            { timestamp: 1621666800000, value: 9.52347664616895 },
            { timestamp: 1621670400000, value: 20.789884691882545 },
            { timestamp: 1621674000000, value: 21.51230983414588 },
            { timestamp: 1621677600000, value: 19.211145898359387 },
            { timestamp: 1621681200000, value: 17.926206755992627 },
            { timestamp: 1621684800000, value: 10.193003474714947 },
            { timestamp: 1621688400000, value: 10.214217541917208 },
            { timestamp: 1621692000000, value: 17.647318068914107 },
            { timestamp: 1621695600000, value: 29.246775513100765 },
            { timestamp: 1621699200000, value: 27.629470391618337 },
            { timestamp: 1621702800000, value: 40.52362753081343 },
            { timestamp: 1621706400000, value: 47.74131711289765 },
            { timestamp: 1621710000000, value: 47.64374630983703 },
            { timestamp: 1621713600000, value: 46.0016253396566 },
            { timestamp: 1621717200000, value: 31.15013297022498 },
          ],
        },
      ],
    },
  },
];

const projects = ['/test', '/test-loading', '/test-error'] as const;

export const cdfApiHandlers = requests.flatMap((request) =>
  projects.map((project) =>
    rest[request.method](
      `${sidecar.cdfApiBaseUrl}/api/v1/projects${project}${request.path}`,
      (_, res, ctx) => {
        switch (project) {
          case '/test':
            return res(ctx.json(request.response));
          case '/test-loading':
            return res(ctx.delay('infinite'));
          case '/test-error':
            return res(ctx.status(503), ctx.json({}));
          default:
            throw new Error('Project not found');
        }
      }
    )
  )
);
