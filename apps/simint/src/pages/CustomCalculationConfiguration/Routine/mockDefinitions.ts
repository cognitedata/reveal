import { DefinitionMap } from '@cognite/simconfig-api-sdk/rtk';

export const definitions: DefinitionMap = {
  calculation: {
    runType: {
      scheduled: 'Scheduled',
      manual: 'Manual',
      external: 'External',
    },
    runStatus: {
      unknown: 'n/a',
      ready: 'Ready',
      running: 'Running',
      success: 'Success',
      failure: 'Failure',
    },
    sortOrder: {
      Calculation: 'Calculation',
      RunType: 'Run type',
      RunTime: 'Run time',
      RunStatus: 'Run status',
    },
  },
  dataModel: {
    dataType: {
      SimulatorFile: 'Simulator File',
      Integration: 'Simulator Integration',
      Configuration: 'Simulation Configuration',
      Calculation: 'Simulation Calculation',
      BoundaryConditionSequence: 'Boundary Condition Time Series Map',
      BoundaryConditionTimeSeries: 'Boundary Condition',
      RunConfiguration: 'Run Configuration',
      SimulationOutput: 'Simulation Output',
      SimulationInput: 'Simulation Input',
      SimulationModelVersion: 'Simulation Model Version',
    },
  },
  features: [
    {
      name: 'Events',
      key: 'ui-events-acl',
      capabilities: [
        {
          capability: 'eventsAcl',
          actions: ['READ', 'WRITE'],
          scope: {},
          enabled: true,
        },
      ],
    },
    {
      name: 'Files',
      key: 'ui-files-acl',
      capabilities: [
        {
          capability: 'filesAcl',
          actions: ['READ', 'WRITE'],
          scope: {},
          enabled: true,
        },
      ],
    },
    {
      name: 'Sequences',
      key: 'ui-sequences-acl',
      capabilities: [
        {
          capability: 'sequencesAcl',
          actions: ['READ', 'WRITE'],
          scope: {},
          enabled: true,
        },
      ],
    },
    {
      name: 'Time Series',
      key: 'ui-timeseries-acl',
      capabilities: [
        {
          capability: 'timeSeriesAcl',
          actions: ['READ', 'WRITE'],
          scope: {},
          enabled: true,
        },
      ],
    },
    {
      name: 'Datasets',
      key: 'ui-datasetsacl',
      capabilities: [
        {
          capability: 'datasetsAcl',
          actions: ['READ'],
          scope: {},
          enabled: true,
        },
      ],
    },
    {
      name: 'Projects',
      key: 'ui-projects-acl',
      capabilities: [
        {
          capability: 'projectsAcl',
          actions: ['READ', 'LIST'],
          scope: {},
          enabled: true,
        },
      ],
    },
    {
      name: 'Groups',
      key: 'ui-groups-acl',
      capabilities: [
        {
          capability: 'groupsAcl',
          actions: ['READ', 'LIST'],
          scope: {},
          enabled: true,
        },
      ],
    },
    {
      name: 'Labels',
      key: 'ui-labels-acl',
      capabilities: [
        {
          capability: 'labelsAcl',
          actions: ['READ', 'WRITE'],
          scope: {},
          enabled: true,
        },
      ],
    },
    {
      name: 'Raw',
      key: 'ui-raw-acl',
      capabilities: [
        {
          capability: 'rawAcl',
          actions: ['READ', 'WRITE', 'LIST'],
          scope: {},
          enabled: true,
        },
      ],
    },
    {
      name: 'Metadata',
      key: 'metadata',
      capabilities: [
        {
          capability: 'rawAcl',
          actions: ['READ', 'WRITE', 'LIST'],
          scope: {},
          enabled: true,
        },
      ],
    },
    {
      name: 'Delete',
      key: 'delete',
      capabilities: [
        {
          capability: 'rawAcl',
          actions: ['READ', 'WRITE', 'LIST'],
          scope: {},
          enabled: true,
        },
      ],
    },
    {
      name: 'Labels',
      key: 'label',
      capabilities: [
        {
          capability: 'labelsAcl',
          actions: ['READ', 'WRITE'],
          scope: {},
          enabled: true,
        },
      ],
    },
    {
      name: 'Read - Connector status',
      key: 'read-connector-status',
      capabilities: [
        {
          capability: 'sequencesAcl',
          actions: ['READ'],
          scope: {},
          enabled: true,
        },
        {
          capability: 'datasetsAcl',
          actions: ['READ'],
          scope: {},
          enabled: true,
        },
      ],
    },
    {
      name: 'Read - Model library',
      key: 'read-model-library',
      capabilities: [
        {
          capability: 'filesAcl',
          actions: ['READ'],
          scope: {},
          enabled: true,
        },
        {
          capability: 'timeSeriesAcl',
          actions: ['READ'],
          scope: {},
          enabled: true,
        },
      ],
    },
    {
      name: 'Read - Model calculations',
      key: 'read-model-calculations',
      capabilities: [
        {
          capability: 'eventsAcl',
          actions: ['READ'],
          scope: {},
          enabled: true,
        },
      ],
    },
    {
      name: 'Write - New models',
      key: 'write-new-models',
      capabilities: [
        {
          capability: 'filesAcl',
          actions: ['WRITE'],
          scope: {},
          enabled: true,
        },
        {
          capability: 'sequencesAcl',
          actions: ['WRITE'],
          scope: {},
          enabled: true,
        },
      ],
    },
    {
      name: 'Write - Run now',
      key: 'write-run-now',
      capabilities: [
        {
          capability: 'eventsAcl',
          actions: ['WRITE'],
          scope: {},
          enabled: true,
        },
      ],
    },
  ],
  unit: {
    gasRate: {
      'MMscf/day': 'MMscf/day',
      '1000Sm3/d': '1000Sm³/d',
      '1000m3/d': '1000m³/d',
      'm3[Vn]/h': 'm³[Vn]/h',
      'Mscf/day': 'Mscf/day',
      'scf/day': 'scf/day',
      'Sm3/day': 'Sm³/day',
    },
    liquidGasRate: {
      'STB/MMscf': 'STB/MMscf',
      'Sm3/Sm3': 'Sm³/Sm³',
      'm3/m3': 'm³/m³',
      'm3/m3Vn': 'm³/m³Vn',
      'STB/m3Vn': 'STB/m³Vn',
      'Sm3/kSm3': 'Sm³/kSm³',
      'Sm3/MSm3': 'Sm³/MSm³',
    },
    liquidRate: {
      'STB/day': 'STB/day',
      'Sm3/day': 'Sm³/day',
      'm3/day': 'm³/day',
      'm3/hour': 'm³/hour',
      'scf/day': 'scf/day',
    },
    percentage: {
      percent: '%',
      fraction: 'fraction',
    },
    permeability: {
      md: 'md',
    },
    pressure: {
      psig: 'psig',
      psia: 'psia',
      BARg: 'BARg',
      BARa: 'BARa',
      'kPa g': 'kPa g',
      'kPa a': 'kPa a',
      'Kg/cm2 g': 'Kg/cm² g',
      'Kg/cm2 a': 'Kg/cm² a',
      'atm a': 'atm a',
    },
    temperature: {
      'deg F': '°F',
      'deg C': '°C',
      'deg R': '°R',
      'deg K': '°K',
    },
    length: {
      meters: 'm',
      feet: 'ft',
      inches: 'in',
      centimeter: 'cm',
      millimeter: 'mm',
      kilometer: 'km',
      miles: 'miles',
      '64ths inch': '64ths inch',
    },
    gasLiquidRate: {
      'scf/STB': 'scf/STB',
      'Sm3/Sm3': 'Sm³/Sm³',
      'm3/m3': 'm³/m³',
      'm3Vn/m3': 'm³Vn/m³',
      'Mscf/STB': 'Mscf/STB',
      'kSm3/Sm3': 'kSm³/Sm³',
    },
    none: {
      none: '',
    },
  },
  simulatorsConfig: [
    {
      key: 'PetroSIM',
      name: 'Petro-SIM',
      fileExtensionType: ['KSC'],
      modelTypes: [
        {
          name: 'Steady State',
          key: 'SteadyState',
        },
      ],
      isBoundaryConditionsEnabled: false,
      isCalculationsEnabled: true,
      unitDefinitions: {
        unitsMap: {
          'Heat Flow Large': {
            label: 'Heat Flow Large',
            units: [
              {
                label: 'kJ/h',
                value: 'kJ/h',
              },
              {
                label: 'kJ/min',
                value: 'kJ/min',
              },
              {
                label: 'kJ/s',
                value: 'kJ/s',
              },
              {
                label: 'MJ/h',
                value: 'MJ/h',
              },
              {
                label: 'J/s',
                value: 'J/s',
              },
              {
                label: 'watt',
                value: 'watt',
              },
              {
                label: 'GJ/h',
                value: 'GJ/h',
              },
              {
                label: 'kW',
                value: 'kW',
              },
              {
                label: 'W',
                value: 'W',
              },
              {
                label: 'MW',
                value: 'MW',
              },
              {
                label: 'GW',
                value: 'GW',
              },
              {
                label: 'kcal/h',
                value: 'kcal/h',
              },
              {
                label: 'cal/h',
                value: 'cal/h',
              },
              {
                label: 'kcal/min',
                value: 'kcal/min',
              },
              {
                label: 'cal/min',
                value: 'cal/min',
              },
              {
                label: 'kcal/s',
                value: 'kcal/s',
              },
              {
                label: 'Gcal/h',
                value: 'Gcal/h',
              },
              {
                label: 'Gcal/hr',
                value: 'Gcal/hr',
              },
              {
                label: 'cal/s',
                value: 'cal/s',
              },
              {
                label: 'Btu/s',
                value: 'Btu/s',
              },
              {
                label: 'Btu/hr',
                value: 'Btu/hr',
              },
              {
                label: 'Btu/h',
                value: 'Btu/h',
              },
              {
                label: 'Btu/day',
                value: 'Btu/day',
              },
              {
                label: 'Btu(tc)/hr',
                value: 'Btu(tc)/hr',
              },
              {
                label: 'MMBtu/hr',
                value: 'MMBtu/hr',
              },
              {
                label: 'MMBtu/day',
                value: 'MMBtu/day',
              },
              {
                label: 'FOEB/day',
                value: 'FOEB/day',
              },
              {
                label: 'MMBtu(tc)/hr',
                value: 'MMBtu(tc)/hr',
              },
              {
                label: 'hp',
                value: 'hp',
              },
              {
                label: 'Mkcal/h',
                value: 'Mkcal/h',
              },
              {
                label: 'Mkcal/hr',
                value: 'Mkcal/hr',
              },
              {
                label: 'MMcal/h',
                value: 'MMcal/h',
              },
              {
                label: 'MMkcal/h',
                value: 'MMkcal/h',
              },
              {
                label: 'MMkcal/hr',
                value: 'MMkcal/hr',
              },
              {
                label: 'TJ/d',
                value: 'TJ/d',
              },
            ],
          },
          Temperature: {
            label: 'Temperature',
            units: [
              {
                label: 'C',
                value: 'C',
              },
              {
                label: 'K',
                value: 'K',
              },
              {
                label: 'F',
                value: 'F',
              },
              {
                label: 'R',
                value: 'R',
              },
            ],
          },
          'Mass Flow': {
            label: 'Mass Flow',
            units: [
              {
                label: 'kg/h',
                value: 'kg/h',
              },
              {
                label: 'kg/hr',
                value: 'kg/hr',
              },
              {
                label: 'kg/min',
                value: 'kg/min',
              },
              {
                label: 'kg/s',
                value: 'kg/s',
              },
              {
                label: 'kg/d',
                value: 'kg/d',
              },
              {
                label: 'tonne/d',
                value: 'tonne/d',
              },
              {
                label: 'kton/d',
                value: 'kton/d',
              },
              {
                label: 't/h',
                value: 't/h',
              },
              {
                label: 'tonne/h',
                value: 'tonne/h',
              },
              {
                label: 'tonne/hr',
                value: 'tonne/hr',
              },
              {
                label: 'mt/hr',
                value: 'mt/hr',
              },
              {
                label: 'tonne/min',
                value: 'tonne/min',
              },
              {
                label: 'g/h',
                value: 'g/h',
              },
              {
                label: 'g/min',
                value: 'g/min',
              },
              {
                label: 'g/s',
                value: 'g/s',
              },
              {
                label: 'lb/s',
                value: 'lb/s',
              },
              {
                label: 'lb/hr',
                value: 'lb/hr',
              },
              {
                label: 'Mlb/hr',
                value: 'Mlb/hr',
              },
              {
                label: 'klb/hr',
                value: 'klb/hr',
              },
              {
                label: 'lb/day',
                value: 'lb/day',
              },
              {
                label: 'lb/d',
                value: 'lb/d',
              },
              {
                label: 'klb/day',
                value: 'klb/day',
              },
              {
                label: 'tn(short)/min',
                value: 'tn(short)/min',
              },
              {
                label: 'tn(short)/h',
                value: 'tn(short)/h',
              },
              {
                label: 'tn(short)/d',
                value: 'tn(short)/d',
              },
            ],
          },

          'Per Area': {
            label: 'Per Area',
            units: [
              {
                label: '1/m2',
                value: '1/m2',
              },
              {
                label: '1/cm2',
                value: '1/cm2',
              },
              {
                label: '1/mm2',
                value: '1/mm2',
              },
              {
                label: '1/ft2',
                value: '1/ft2',
              },
              {
                label: '1/in2',
                value: '1/in2',
              },
              {
                label: '1/yd2',
                value: '1/yd2',
              },
            ],
          },
        },
        unitSystem: {},
      },
      enabled: true,
      stepFields: {
        steps: [
          {
            stepType: 'get/set',
            fields: [
              {
                name: 'objectType',
                label: 'Simulation Object Type',
                info: 'Enter the type of the PetroSIM object, i.e. Material Stream',
              },
              {
                name: 'objectName',
                label: 'Simulation Object Name',
                info: 'Enter the name of the PetroSIM object, i.e. Feed',
              },
              {
                name: 'objectProperty',
                label: 'Simulation Object Property',
                info: 'Enter the property of the PetroSIM object, i.e. Temperature',
              },
            ],
          },
          {
            stepType: 'command',
            fields: [
              {
                name: 'type',
                label: 'Command',
                options: [
                  {
                    label: 'Pause Solver',
                    value: 'Pause',
                  },
                  {
                    label: 'Solve Flowsheet',
                    value: 'Solve',
                  },
                ],
                info: 'Select a command',
              },
            ],
          },
        ],
      },
    },
  ],
  type: {
    simulator: {
      UNKNOWN: 'Unknown',
      PROSPER: 'PROSPER',
      GAP: 'GAP',
      MBAL: 'MBAL',
      ProcessSim: 'ProcessSim',
      DWSIM: 'DWSIM',
      SYMMETRY: 'Symmetry',
      PETROSIM: 'PetroSIM',
    },
    aggregate: {
      average: 'Average',
      max: 'Maximum',
      min: 'Minimum',
      count: 'Count',
      sum: 'Sum',
      stepInterpolation: 'Step interpolation',
      interpolation: 'Interpolation',
      totalVariation: 'Total variation',
      continuousVariance: 'Continuous variance',
      discreteVariance: 'Discrete variance',
    },
    boundaryCondition: {
      ResPress: 'Reservoir pressure',
      CGR: 'Condensate gas ratio',
      WGR: 'Water gas ratio',
      Skin: 'Skin',
      N2: 'Nitrogen content',
      ResTemp: 'Reservoir temperature',
      WellLen: 'Well length',
      ResPerm: 'Reservoir permeability',
      ResThick: 'Reservoir thickness',
      SeparatorGOR: 'Gas to Oil Ratio at the Separator',
      TankGOR: 'Gas to Oil Ratio at the Stock Tank',
      SolutionGOR: 'Solution Gas to Oil Ratio',
    },
    calculation: {
      'IPR/VLP': 'Rate by Nodal Analysis',
      ChokeDp: 'Rate by Choke Performance',
      VLP: 'Rate by Lift Curve Solution',
      IPR: 'Rate by Inflow Performance',
      BhpFromRate: 'BHP from Rate',
      BhpFromGradientTraverse: 'BHP From Gradient Traverse',
      BhpFromGaugeBhp: 'BHP from Gauge BHP',
      UserDefined: 'User Defined',
    },
    calculationAggregate: {
      stepInterpolation: 'Step interpolation',
      interpolation: 'Interpolation',
      average: 'Average',
    },
    check: {
      eq: '=',
      ne: '≠',
      gt: '>',
      ge: '≥',
      lt: '<',
      le: '≤',
    },
    timeInterval: {
      m: 'minute',
      h: 'hour',
      d: 'day',
      w: 'week',
    },
    timeSeries: {
      THT: {
        name: 'Tubing Head Temperature',
        unitType: 'Temperature',
      },
      flowlinePressure: {
        name: 'Flowline Pressure',
        unitType: 'Pressure',
      },
      chokePosition: {
        name: 'Choke Opening',
        unitType: 'Percentage',
      },
      THP: {
        name: 'Tubing Head Pressure',
        unitType: 'Pressure',
      },
      CGR: {
        name: 'Condensate Gas Ratio',
        unitType: 'LiqRate/GasRate',
      },
      WGR: {
        name: 'Water Gas Ratio',
        unitType: 'LiqRate/GasRate',
      },
      GasRate: {
        name: 'Gas Flowrate',
        unitType: 'GasRate',
      },
      OilRate: {
        name: 'Oil Flowrate',
        unitType: 'LiqRate',
      },
      WatRate: {
        name: 'Water Flowrate',
        unitType: 'LiqRate',
      },
      LiqRate: {
        name: 'Liquid Flowrate',
        unitType: 'LiqRate',
      },
      BHP: {
        name: 'Bottom Hole Pressure',
        unitType: 'Pressure',
      },
      BHPg: {
        name: 'Bottom Hole Pressure Gauge',
        unitType: 'Pressure',
      },
      ResPress: {
        name: 'Reservoir pressure',
        unitType: 'Pressure',
      },
      Skin: {
        name: 'Skin',
        unitType: 'None',
      },
      N2: {
        name: 'Nitrogen Content',
        unitType: 'Percentage',
      },
      ResTemp: {
        name: 'Reservoir Temperature',
        unitType: 'Temperature',
      },
      WellLen: {
        name: 'Well Length',
        unitType: 'Length',
      },
      ResPerm: {
        name: 'Reservoir Permeability',
        unitType: 'Permeability',
      },
      ResThick: {
        name: 'Reservoir Thickness',
        unitType: 'Length',
      },
      SeparatorGOR: {
        name: 'Gas to Oil Ratio at the Separator',
        unitType: 'GasRate/LiqRate',
      },
      TankGOR: {
        name: 'Gas to Oil Ratio at the Stock Tank',
        unitType: 'GasRate/LiqRate',
      },
      GOR: {
        name: 'Gas to Oil Ratio',
        unitType: 'GasRate/LiqRate',
      },
      WC: {
        name: 'Water Cut',
        unitType: 'Percentage',
      },
      GasLiftRate: {
        name: 'Gas Liftrate',
        unitType: 'GasRate',
      },
    },
    unitSystem: {
      OilField: 'Oil field units',
      NorSI: 'Norwegian SI units',
      CanSI: 'Canadian SI units',
      GerSI: 'German SI units',
      FreSI: 'French SI units',
      LatSI: 'Latin SI units',
    },
    rootFindingSolution: {
      min: 'Min',
      max: 'Max',
    },
    bhpEstimationMethod: {
      GradientTraverse: 'Gradient Traverse',
      LiftCurveGaugeBhp: 'Lift Curve (Gauge BHP)',
      LiftCurveRate: 'Lift Curve (Rate)',
    },
    model: {
      OilWell: 'Oil and Water Well',
      GasWell: 'Dry and Wet Gas Well',
      RetrogradeWell: 'Retrograde Condensate Well',
    },
    simulationStep: {
      Get: 'Get',
      Set: 'Set',
      Command: 'Command',
    },
  },
};
