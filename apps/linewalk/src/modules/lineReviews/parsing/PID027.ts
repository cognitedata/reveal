/* eslint-disable @typescript-eslint/no-loss-of-precision */
export default {
  viewBox: {
    x: 0,
    y: 0,
    width: 1632,
    height: 1056,
  },
  symbols: [
    {
      symbolName: 'fileConnection',
      svgRepresentations: [
        {
          boundingBox: {
            x: 71.57328033447266,
            y: 373.9732666015625,
            width: 93.7600326538086,
            height: 17.440032958984375,
          },
          svgPaths: [
            {
              svgCommands:
                'M 83.41329956054688 391.4132995605469 h 81.92001342773438',
            },
            {
              svgCommands:
                'M 83.41329956054688 391.4132995605469 l -11.840019226074219 -8.6400146484375 l 11.840019226074219 -8.800018310546875',
            },
            {
              svgCommands:
                'M 130.13327026367188 391.4132995605469 v -17.440032958984375',
            },
            {
              svgCommands:
                'M 165.33331298828125 391.4132995605469 l -5.760040283203125 -8.6400146484375 l 5.760040283203125 -8.800018310546875 h -81.92001342773438',
            },
          ],
        },
      ],
    },
  ],
  lines: [
    {
      id: 'path22578',
      symbolName: 'Line',
      pathIds: ['path22578'],
      svgRepresentation: {
        boundingBox: {
          x: 159.57327270507812,
          y: 382.7732849121094,
          width: 188.32000732421875,
          height: 0,
        },
        svgPaths: [
          {
            svgCommands: 'M 1.0000 0.0000 h -1.0000',
          },
        ],
      },
      labelIds: [],
      labels: [],
    },
    {
      id: 'path22274',
      symbolName: 'Line',
      pathIds: ['path22274'],
      svgRepresentation: {
        boundingBox: {
          x: 341.8132629394531,
          y: 319.5732727050781,
          width: 0,
          height: 63.20001220703125,
        },
        svgPaths: [
          {
            svgCommands: 'M 0.0000 0.0000 v 1.0000',
          },
        ],
      },
      labelIds: [],
      labels: [],
    },
    {
      id: 'path22278',
      symbolName: 'Line',
      pathIds: ['path22278'],
      svgRepresentation: {
        boundingBox: {
          x: 341.8132629394531,
          y: 319.5732727050781,
          width: 61.760009765625,
          height: 0,
        },
        svgPaths: [
          {
            svgCommands: 'M 1.0000 0.0000 h -1.0000',
          },
        ],
      },
      labelIds: [],
      labels: [],
    },
  ],
  symbolInstances: [
    {
      id: 'path22168-path22170-path22172-path22174',
      symbolName: 'fileConnection',
      pathIds: ['path22168', 'path22170', 'path22172', 'path22174'],
      svgRepresentation: {
        boundingBox: {
          x: 71.57328033447266,
          y: 373.9732666015625,
          width: 93.7600326538086,
          height: 17.440032958984375,
        },
        svgPaths: [
          {
            svgCommands: 'M 0.1263 1.0000 h 0.8737',
          },
          {
            svgCommands: 'M 0.1263 1.0000 l -0.1263 -0.4954 l 0.1263 -0.5046',
          },
          {
            svgCommands: 'M 0.6246 1.0000 v -1.0000',
          },
          {
            svgCommands:
              'M 1.0000 1.0000 l -0.0614 -0.4954 l 0.0614 -0.5046 h -0.8737',
          },
        ],
      },
      labelIds: [],
      labels: [],
    },
  ],
  connections: [
    {
      start: 'path22168-path22170-path22172-path22174',
      end: 'path22578',
      direction: 'unknown',
    },
    {
      start: 'path22578',
      end: 'path22274',
      direction: 'unknown',
    },
    {
      start: 'path22274',
      end: 'path22278',
      direction: 'unknown',
    },
  ],
};
