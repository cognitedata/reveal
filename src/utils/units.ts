import { DatapointAggregate, DoubleDatapoint } from '@cognite/sdk';

export const units = [
  { label: 'PSI', value: 'psi', conversions: ['psi', 'bar', 'pa'] },
  { label: 'Bar', value: 'bar', conversions: ['psi', 'bar', 'pa'] },
  { label: 'Pascal', value: 'pa', conversions: ['psi', 'bar', 'pa'] },
];

const conversions: any = {
  psi: {
    psi: (val: number): number => val,
    bar: (val: number): number => val * 0.0689475729,
    pa: (val: number): number => val * 6894.76,
  },
  bar: {
    psi: (val: number): number => val / 0.0689475729,
    bar: (val: number): number => val,
    pa: (val: number): number => val * 100000,
  },
  pa: {
    psi: (val: number): number => val / 0.0689475729,
    bar: (val: number): number => val / 100000,
    pa: (val: number): number => val,
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
