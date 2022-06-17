import type { CalculationTypeModel } from '@cognite/simconfig-api-sdk/rtk';

type CalculationSchema = Partial<
  Record<
    CalculationTypeModel['calcType'],
    CalculationTypeModel & {
      xAxis: {
        column: string;
        unitType: string;
        unit: string;
      };
      yAxis: {
        columns: readonly string[];
        unitType: string;
        unit: string;
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
      unit: 'MMscf/day', // should come from the column metadata
    },
    yAxis: {
      columns: [
        'VLP Pressure', // can be one or more columns, each one representing one trace
        'IPR Pressure', // but they all need to be of the same unit and unitType
      ],
      unitType: 'Pressure', // should come from the column metadata
      unit: 'psig', // should come from the column metadata
    },
  },
  'ChokeDp': {
    calcType: 'ChokeDp',
    calcName: 'Rate by Choke Performance',
    xAxis: {
      column: 'Gas Rate',
      unitType: 'GasRate',
      unit: 'MMscf/day',
    },
    yAxis: {
      columns: ['Outlet Pressure'],
      unitType: 'Pressure',
      unit: 'psig',
    },
  },
  'VLP': {
    calcType: 'VLP',
    calcName: 'Rate by Lift Curve Solution',
    xAxis: {
      column: 'Gas Rate',
      unitType: 'GasRate',
      unit: 'MMscf/day',
    },
    yAxis: {
      columns: ['Bottom Hole Pressure'],
      unitType: 'Pressure',
      unit: 'psig',
    },
  },
  'IPR': {
    calcType: 'IPR',
    calcName: 'Rate by Inflow Performance',
    xAxis: {
      column: 'Gas Rate',
      unitType: 'GasRate',
      unit: 'MMscf/day',
    },
    yAxis: {
      columns: ['IPR Pressure'],
      unitType: 'Pressure',
      unit: 'psig',
    },
  },
} as const;
