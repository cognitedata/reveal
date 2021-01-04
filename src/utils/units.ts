import { DatapointAggregate, DoubleDatapoint } from '@cognite/sdk';

export const units = [
  { label: 'PSI', value: 'psi', conversions: ['psi', 'bar', 'barg'] },
  { label: 'Bar', value: 'bar', conversions: ['psi', 'bar', 'barg'] },
  { label: 'Bar(g)', value: 'barg', conversions: ['psi', 'bar', 'barg'] },
];

const conversions: any = {
  psi: {
    psi: (val: number): number => val,
    bar: (val: number): number => val * 2,
    barg: (val: number): number => val * 4,
  },
  bar: {
    psi: (val: number): number => val / 2,
    bar: (val: number): number => val * 2,
    barg: (val: number): number => val,
  },
  barg: {
    psi: (val: number): number => val / 4,
    bar: (val: number): number => val / 2,
    barg: (val: number): number => val,
  },
};

export const convertUnits = async (
  datapoints: (DoubleDatapoint | DatapointAggregate)[],
  inputUnit: string = '',
  outputUnit: string = ''
): Promise<(DoubleDatapoint | DatapointAggregate)[]> => {
  const convert: (val: number) => number =
    (conversions[inputUnit] || {})[outputUnit] || ((val) => val);

  return datapoints.map((x) => ({
    ...x,
    ...('average' in x
      ? {
          average: convert(x.average!),
        }
      : {}),
    ...('value' in x ? { value: convert(x.value) } : {}),
  }));
};
