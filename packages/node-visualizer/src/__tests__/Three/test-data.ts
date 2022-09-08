export const data = {
  wells: [
    {
      matchingId: '12227f80-87d1-450c-8026-e8c7c64efb6c',
      name: 'OPH23672416',
      wellhead: {
        x: -85.733932,
        y: 24.272891,
        crs: 'EPSG:4326',
      },
      sources: [
        {
          assetExternalId: 'wells/ophiuchus/well-OPH23672416',
          sourceName: 'ophiuchus',
        },
      ],
      description: 'Well OPH23672416',
      country: 'ophiuchus',
      quadrant: null,
      region: 'Sinistra',
      block: 'C',
      field: 'Nu Ophiuchi',
      operator: 'Pretty Polly ASA',
      spudDate: '2017-12-28T00:00:00.000Z',
      wellType: 'Production',
      license: null,
      waterDepth: {
        value: 1932,
        unit: 'm',
      },
      wellbores: [
        {
          matchingId: 'wells/ophiuchus/well-OPH23672416/wellbores/wb-01',
          name: 'OPH2367241601',
          wellMatchingId: '12227f80-87d1-450c-8026-e8c7c64efb6c',
          sources: [
            {
              assetExternalId:
                'wells/ophiuchus/well-OPH23672416/wellbores/wb-01',
              sourceName: 'ophiuchus',
            },
          ],
          description: 'Wellbore OPH2367241601',
          parentWellboreMatchingId: null,
          datum: {
            value: 52.9,
            unit: 'm',
            reference: 'KB',
          },
          id: 'wells/ophiuchus/well-OPH23672416/wellbores/wb-01',
          wellId: '12227f80-87d1-450c-8026-e8c7c64efb6c',
          wellName: 'OPH23672416',
          wellWaterDepth: {
            value: 1932,
            unit: 'm',
          },
          title: 'Wellbore OPH2367241601 OPH2367241601',
          color: '#1AA3C1',
        },
      ],
      id: '12227f80-87d1-450c-8026-e8c7c64efb6c',
      geometry: {
        type: 'Point',
        coordinates: [-85.733932, 24.272891],
      },
      sourceList: 'ophiuchus',
      metadata: {
        x_coordinate: -85.733932,
        y_coordinate: 24.272891,
        water_depth: 1932,
        water_depth_unit: 'm',
      },
    },
  ],
  wellBores: [
    {
      matchingId: 'wells/ophiuchus/well-OPH23672416/wellbores/wb-01',
      name: 'OPH2367241601',
      wellMatchingId: '12227f80-87d1-450c-8026-e8c7c64efb6c',
      sources: [
        {
          assetExternalId: 'wells/ophiuchus/well-OPH23672416/wellbores/wb-01',
          sourceName: 'ophiuchus',
        },
      ],
      description: 'Wellbore OPH2367241601',
      parentWellboreMatchingId: null,
      datum: {
        value: 52.9,
        unit: 'm',
        reference: 'KB',
      },
      id: 'wells/ophiuchus/well-OPH23672416/wellbores/wb-01',
      wellId: '12227f80-87d1-450c-8026-e8c7c64efb6c',
      wellName: 'OPH23672416',
      wellWaterDepth: {
        value: 1932,
        unit: 'm',
      },
      title: 'Wellbore OPH2367241601 OPH2367241601',
      color: '#1AA3C1',
      metadata: {
        elevation_value_unit: 'm',
        elevation_value: '52.9',
        elevation_type: 'KB',
        bh_x_coordinate: '-85.733932',
        bh_y_coordinate: '24.272891',
      },
      parentId: '12227f80-87d1-450c-8026-e8c7c64efb6c',
    },
  ],
  trajectories: [
    {
      id: 'wells/ophiuchus/well-OPH23672416/wellbores/wb-01',
      assetId: 'wells/ophiuchus/well-OPH23672416/wellbores/wb-01',
      externalId: 'ophiuchus:tr:1:s:0:0',
      name: 'ophiuchus',
    },
  ],
  trajectoryData: [
    {
      measuredDepthUnit: 'm',
      trueVerticalDepthUnit: 'm',
      id: 'wells/ophiuchus/well-OPH23672416/wellbores/wb-01',
      externalId: 'ophiuchus:tr:1:s:0:0',
      columns: [
        {
          name: 'trueVerticalDepth',
          valueType: 'DOUBLE',
        },
        {
          name: 'measuredDepth',
          valueType: 'DOUBLE',
        },
        {
          name: 'northOffset',
          valueType: 'DOUBLE',
        },
        {
          name: 'eastOffset',
          valueType: 'DOUBLE',
        },
        {
          name: 'azimuth',
          valueType: 'DOUBLE',
        },
        {
          name: 'inclination',
          valueType: 'DOUBLE',
        },
        {
          name: 'doglegSeverity',
          valueType: 'DOUBLE',
        },
        {
          name: 'equivalentDeparture',
          valueType: 'DOUBLE',
        },
        {
          name: 'northing',
          valueType: 'DOUBLE',
        },
        {
          name: 'easting',
          valueType: 'DOUBLE',
        },
      ],
      rows: [
        {
          rowNumber: 41,
          values: [
            3654.4873210823425, 3746.1756097560974, 654.4013407779088,
            52.847357749785175, 10.573512883242941, 7.390443693303469,
            0.2630429025613934, 656.5317646794088, 24.278769586387057,
            -85.7334112025396,
          ],
        },
        {
          rowNumber: 42,
          values: [
            3747.4098696487144, 3839.83, 665.8924937590251, 54.957578499790834,
            10.227287481174168, 6.942197641950065, 0.1442495523957194,
            668.1565300729867, 24.278872813098914, -85.73339040640306,
          ],
        },
      ],
    },
  ],
  casings: [],
  ndsEvents: [],
  nptEvents: [],
  logs: {},
};
