import { DatapointAggregate, DoubleDatapoint } from '@cognite/sdk';

export const units = [
  // Pressure
  {
    label: 'psi',
    value: 'psi',
    conversions: ['psi', 'bar', 'pa', 'atm', 'mpa'],
  },
  {
    label: 'bar',
    value: 'bar',
    conversions: ['psi', 'bar', 'pa', 'atm', 'mpa'],
  },
  { label: 'Pa', value: 'pa', conversions: ['psi', 'bar', 'pa', 'atm', 'mpa'] },
  {
    label: 'atm',
    value: 'atm',
    conversions: ['psi', 'bar', 'pa', 'atm', 'mpa'],
  },
  {
    label: 'MPa',
    value: 'mpa',
    conversions: ['psi', 'bar', 'pa', 'atm', 'mpa'],
  },

  // Length
  {
    label: 'm',
    value: 'm',
    conversions: ['m', 'cm', 'mm', 'yd', 'ft', 'in', 'km', 'mi'],
  },
  {
    label: 'cm',
    value: 'cm',
    conversions: ['m', 'cm', 'mm', 'yd', 'ft', 'in', 'km', 'mi'],
  },
  {
    label: 'mm',
    value: 'mm',
    conversions: ['m', 'cm', 'mm', 'yd', 'ft', 'in', 'km', 'mi'],
  },
  {
    label: 'yd',
    value: 'yd',
    conversions: ['m', 'cm', 'mm', 'yd', 'ft', 'in', 'km', 'mi'],
  },
  {
    label: 'ft',
    value: 'ft',
    conversions: ['m', 'cm', 'mm', 'yd', 'ft', 'in', 'km', 'mi'],
  },
  {
    label: 'in',
    value: 'in',
    conversions: ['m', 'cm', 'mm', 'yd', 'ft', 'in', 'km', 'mi'],
  },
  {
    label: 'km',
    value: 'km',
    conversions: ['m', 'cm', 'mm', 'yd', 'ft', 'in', 'km', 'mi'],
  },
  {
    label: 'mi',
    value: 'mi',
    conversions: ['m', 'cm', 'mm', 'yd', 'ft', 'in', 'km', 'mi'],
  },
  // Temperature
  { label: 'F', value: 'F', conversions: ['F', 'C', 'K'] },
  { label: 'C', value: 'C', conversions: ['F', 'C', 'K'] },
  { label: 'K', value: 'K', conversions: ['F', 'C', 'K'] },
  // Volumetric flow rate
  // Sources:
  //  https://petroleumoffice.com/unitconverter/volume%20flow%20rate
  //  https://github.com/cognitedata/inso-toolbox/blob/master/inso_toolbox/units/units.py
  {
    label: 'm^3/s',
    value: 'm3s',
    conversions: ['m3s', 'm3min', 'm3hr', 'm3d', 'bbld', 'mbbld', 'mmscfd'],
  },
  {
    label: 'm^3/min',
    value: 'm3min',
    conversions: ['m3s', 'm3min', 'm3hr', 'm3d', 'bbld', 'mbbld', 'mmscfd'],
  },
  {
    label: 'm^3/hr',
    value: 'm3hr',
    conversions: ['m3s', 'm3min', 'm3hr', 'm3d', 'bbld', 'mbbld', 'mmscfd'],
  },
  {
    label: 'm^3/d',
    value: 'm3d',
    conversions: ['m3s', 'm3min', 'm3hr', 'm3d', 'bbld', 'mbbld', 'mmscfd'],
  },
  {
    label: 'bbl/d',
    value: 'bbld',
    conversions: ['m3s', 'm3min', 'm3hr', 'm3d', 'bbld', 'mbbld', 'mmscfd'],
  },
  {
    label: 'mbbl/d',
    value: 'mbbld',
    conversions: ['m3s', 'm3min', 'm3hr', 'm3d', 'bbld', 'mbbld', 'mmscfd'],
  },
  {
    label: 'mmscfd',
    value: 'mmscfd',
    conversions: [
      'm3s',
      'm3min',
      'm3hr',
      'm3d',
      'bbld',
      'mbbld',
      'mbbld',
      'mmscfd',
    ],
  },
];

export const conversions: any = {
  // Pressure: ['psi', 'bar', 'pa', 'atm', 'mpa]
  psi: {
    psi: (val: number): number => val,
    bar: (val: number): number => val * 0.0689475729,
    pa: (val: number): number => val * 6894.76,
    atm: (val: number): number => val * 0.068045964,
    mpa: (val: number): number => val / 145.038,
  },
  bar: {
    psi: (val: number): number => val / 0.0689475729,
    bar: (val: number): number => val,
    pa: (val: number): number => val * 100000,
    atm: (val: number): number => val * 0.98692326671,
    mpa: (val: number): number => val / 10,
  },
  pa: {
    psi: (val: number): number => val * 0.000145038,
    bar: (val: number): number => val / 100000,
    pa: (val: number): number => val,
    atm: (val: number): number => val * 0.0000098692,
    mpa: (val: number): number => val / 1e6,
  },
  atm: {
    psi: (val: number): number => val * 14.6959487755142,
    bar: (val: number): number => val * 1.01325,
    pa: (val: number): number => val * 101325,
    atm: (val: number): number => val,
    mpa: (val: number): number => val / 9.8692,
  },
  mpa: {
    psi: (val: number): number => val * 145.038,
    bar: (val: number): number => val * 10,
    pa: (val: number): number => val * 1e6,
    atm: (val: number): number => val * 9.8692,
    mpa: (val: number): number => val,
  },

  // Length: ['m', 'cm', 'mm', 'yd', 'ft', 'in', 'km', 'mi']
  m: {
    m: (val: number): number => val,
    cm: (val: number): number => val * 100,
    mm: (val: number): number => val * 1000,
    yd: (val: number): number => val * 1.09361,
    ft: (val: number): number => val * 3.28083,
    in: (val: number): number => val * 39.36996,
    km: (val: number): number => val / 1000,
    mi: (val: number): number => val / 1609.34,
  },
  cm: {
    m: (val: number): number => val / 100,
    cm: (val: number): number => val,
    mm: (val: number): number => val * 10,
    yd: (val: number): number => val / 91.44,
    ft: (val: number): number => val / 30.48,
    in: (val: number): number => val / 2.54,
    km: (val: number): number => val / 100000,
    mi: (val: number): number => val / 160934,
  },
  mm: {
    m: (val: number): number => val / 1000,
    cm: (val: number): number => val / 10,
    mm: (val: number): number => val,
    yd: (val: number): number => val / 914.4,
    ft: (val: number): number => val / 304.8,
    in: (val: number): number => val / 25.4,
    km: (val: number): number => val / 1000000,
    mi: (val: number): number => val / 1609340,
  },
  yd: {
    m: (val: number): number => val / 1.094,
    cm: (val: number): number => val * 91.44,
    mm: (val: number): number => val * 914.4,
    yd: (val: number): number => val,
    ft: (val: number): number => val * 3,
    in: (val: number): number => val * 36,
    km: (val: number): number => val / 1094,
    mi: (val: number): number => val / 1760,
  },
  ft: {
    m: (val: number): number => val / 3.281,
    cm: (val: number): number => val * 30.48,
    mm: (val: number): number => val * 304.8,
    yd: (val: number): number => val / 3,
    ft: (val: number): number => val,
    in: (val: number): number => val * 12,
    km: (val: number): number => val / 3280.83,
    mi: (val: number): number => val / 5280,
  },
  in: {
    m: (val: number): number => val / 39.37,
    cm: (val: number): number => val * 2.54,
    mm: (val: number): number => val * 25.4,
    yd: (val: number): number => val / 36,
    ft: (val: number): number => val / 12,
    in: (val: number): number => val,
    km: (val: number): number => val / 39370,
    mi: (val: number): number => val / 63360,
  },
  km: {
    m: (val: number): number => val * 1000,
    cm: (val: number): number => val * 100000,
    mm: (val: number): number => val * 1000000,
    yd: (val: number): number => val * 1093.61,
    ft: (val: number): number => val * 3280.84,
    in: (val: number): number => val * 39370.1,
    km: (val: number): number => val,
    mi: (val: number): number => val / 1.609,
  },
  mi: {
    m: (val: number): number => val * 1609.34,
    cm: (val: number): number => val * 160934,
    mm: (val: number): number => val * 1609340,
    yd: (val: number): number => val * 1760,
    ft: (val: number): number => val * 5279.98407552,
    in: (val: number): number => val * 63359.80890624,
    km: (val: number): number => val * 1.6093391462184960528,
    mi: (val: number): number => val,
  },
  // Temperature: ['F', 'C', 'K']
  F: {
    F: (val: number): number => val,
    C: (val: number): number => ((val - 32) * 5) / 9,
    K: (val: number): number => ((val - 32) * 5) / 9 + 273.15,
  },
  C: {
    F: (val: number): number => (val * 9) / 5 + 32,
    C: (val: number): number => val,
    K: (val: number): number => val + 273.15,
  },
  K: {
    F: (val: number): number => ((val - 273.15) * 9) / 5 + 32,
    C: (val: number): number => val - 273.15,
    K: (val: number): number => val,
  },
  // Volumetric flow rate ['m3s', 'm3min', 'm3hr', 'm3d', 'bbld', 'mbbld', 'mmscfd']
  m3s: {
    m3s: (val: number): number => val,
    m3min: (val: number): number => val * 60.0,
    m3hr: (val: number): number => val * 3600.0,
    m3d: (val: number): number => val * 86400.0,
    bbld: (val: number): number => val * 543439.65056533,
    mbbld: (val: number): number => val * 543.43965056533,
    mmscfd: (val: number): number => val * 3.051187,
  },
  m3min: {
    m3s: (val: number): number => val / 60,
    m3min: (val: number): number => val,
    m3hr: (val: number): number => val * 60.0,
    m3d: (val: number): number => val * 1440.0,
    bbld: (val: number): number => val * 9057.3275094226,
    mbbld: (val: number): number => val * 9.0573275094226,
    mmscfd: (val: number): number => (val * 3.051187) / 60,
  },
  m3hr: {
    m3s: (val: number): number => val / 3600,
    m3min: (val: number): number => val / 60.0,
    m3hr: (val: number): number => val,
    m3d: (val: number): number => val * 24.0,
    bbld: (val: number): number => val * 150.95545849037,
    mbbld: (val: number): number => val * 0.15095545849037,
    mmscfd: (val: number): number => (val * 3.051187) / 3600,
  },
  m3d: {
    m3s: (val: number): number => val / 86400,
    m3min: (val: number): number => val / 1440,
    m3hr: (val: number): number => val / 24,
    m3d: (val: number): number => val,
    bbld: (val: number): number => val * 6.2898107704332,
    mbbld: (val: number): number => val * 0.0062898107704332,
    mmscfd: (val: number): number => (val * 3.051187) / 3600 / 24,
  },
  bbld: {
    m3s: (val: number): number => val / 543439.65056533,
    m3min: (val: number): number => (val * 60) / 543439.65056533,
    m3hr: (val: number): number => (val * 3600.0) / 543439.65056533,
    m3d: (val: number): number => (val * 86400.0) / 543439.65056533,
    bbld: (val: number): number => val,
    mbbld: (val: number): number => val / 1000,
    mmscfd: (val: number): number => val / 177700.59,
  },
  mbbld: {
    m3s: (val: number): number => val * 0.00184013,
    m3min: (val: number): number => val * 60 * 0.00184013,
    m3hr: (val: number): number => val * 3600.0 * 0.00184013,
    m3d: (val: number): number => val * 86400.0 * 0.00184013,
    bbld: (val: number): number => val * 1000,
    mbbld: (val: number): number => val,
    mmscfd: (val: number): number => val / 177.70059,
  },
  mmscfd: {
    m3s: (val: number): number => (val * 1177.17) / 3600,
    m3min: (val: number): number => (val * 1177.17) / 60,
    m3hr: (val: number): number => val * 1177.17,
    m3d: (val: number): number => val * 1177.17 * 24,
    bbld: (val: number): number => val * 177700.59,
    mbbld: (val: number): number => val * 177.70059,
    mmscfd: (val: number): number => val,
  },
};

export const convertUnits = (
  datapoints: (DoubleDatapoint | DatapointAggregate)[],
  inputUnit: string = '',
  outputUnit: string = ''
): (DoubleDatapoint | DatapointAggregate)[] => {
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
