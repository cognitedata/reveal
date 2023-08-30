import type { CalculationTypeModel } from '@cognite/simconfig-api-sdk/rtk';

type CalculationSchema = Partial<
  Record<
    CalculationTypeModel['calcType'],
    CalculationTypeModel & {
      xAxis: {
        column: string;
        unitType: string;
      };
      yAxis: {
        columns: readonly string[];
        unitType: string;
      };
    }
  >
>;

export const calculationSchema: CalculationSchema = {
  'IPR/VLP': {
    calcType: 'IPR/VLP',
    calcName: 'Rate by Nodal Analysis',
    xAxis: {
      column: 'Gas Rate',
      unitType: 'GasRate', // should come from the column metadata
    },
    yAxis: {
      columns: [
        'VLP Pressure', // can be one or more columns, each one representing one trace
        'IPR Pressure', // but they all need to be of the same unit and unitType
      ],
      unitType: 'Pressure', // should come from the column metadata
    },
  },
  ChokeDp: {
    calcType: 'ChokeDp',
    calcName: 'Rate by Choke Performance',
    xAxis: {
      column: 'Outlet Pressure',
      unitType: 'Pressure',
    },
    yAxis: {
      columns: ['Gas Rate'],
      unitType: 'GasRate',
    },
  },
  VLP: {
    calcType: 'VLP',
    calcName: 'Rate by Lift Curve Solution',
    xAxis: {
      column: 'Gas Rate',
      unitType: 'GasRate',
    },
    yAxis: {
      columns: ['Bottom Hole Pressure'],
      unitType: 'Pressure',
    },
  },
  IPR: {
    calcType: 'IPR',
    calcName: 'Rate by Inflow Performance',
    xAxis: {
      column: 'Gas Rate',
      unitType: 'GasRate',
    },
    yAxis: {
      columns: ['IPR Pressure'],
      unitType: 'Pressure',
    },
  },
} as const;
