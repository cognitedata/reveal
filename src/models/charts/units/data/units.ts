import { UnitTypes } from '../types/UnitTypes';

const units = [
  // Pressure
  {
    label: 'psi',
    value: 'psi',
    conversions: ['psi', 'bar', 'pa', 'atm', 'mpa'],
    type: UnitTypes.PRESSURE,
  },
  {
    label: 'bar',
    value: 'bar',
    conversions: ['psi', 'bar', 'pa', 'atm', 'mpa'],
    type: UnitTypes.PRESSURE,
  },
  {
    label: 'Pa',
    value: 'pa',
    conversions: ['psi', 'bar', 'pa', 'atm', 'mpa'],
    type: UnitTypes.PRESSURE,
  },
  {
    label: 'atm',
    value: 'atm',
    conversions: ['psi', 'bar', 'pa', 'atm', 'mpa'],
    type: UnitTypes.PRESSURE,
  },
  {
    label: 'MPa',
    value: 'mpa',
    conversions: ['psi', 'bar', 'pa', 'atm', 'mpa'],
    type: UnitTypes.PRESSURE,
  },

  // Length
  {
    label: 'm',
    value: 'm',
    conversions: ['m', 'cm', 'mm', 'yd', 'ft', 'in', 'km', 'mi'],
    type: UnitTypes.LENGTH,
  },
  {
    label: 'cm',
    value: 'cm',
    conversions: ['m', 'cm', 'mm', 'yd', 'ft', 'in', 'km', 'mi'],
    type: UnitTypes.LENGTH,
  },
  {
    label: 'mm',
    value: 'mm',
    conversions: ['m', 'cm', 'mm', 'yd', 'ft', 'in', 'km', 'mi'],
    type: UnitTypes.LENGTH,
  },
  {
    label: 'yd',
    value: 'yd',
    conversions: ['m', 'cm', 'mm', 'yd', 'ft', 'in', 'km', 'mi'],
    type: UnitTypes.LENGTH,
  },
  {
    label: 'ft',
    value: 'ft',
    conversions: ['m', 'cm', 'mm', 'yd', 'ft', 'in', 'km', 'mi'],
    type: UnitTypes.LENGTH,
  },
  {
    label: 'in',
    value: 'in',
    conversions: ['m', 'cm', 'mm', 'yd', 'ft', 'in', 'km', 'mi'],
    type: UnitTypes.LENGTH,
  },
  {
    label: 'km',
    value: 'km',
    conversions: ['m', 'cm', 'mm', 'yd', 'ft', 'in', 'km', 'mi'],
    type: UnitTypes.LENGTH,
  },
  {
    label: 'mi',
    value: 'mi',
    conversions: ['m', 'cm', 'mm', 'yd', 'ft', 'in', 'km', 'mi'],
    type: UnitTypes.LENGTH,
  },
  // Temperature
  {
    label: '°F',
    value: 'f',
    conversions: ['f', 'c', 'k'],
    type: UnitTypes.TEMPERATURE,
  },
  {
    label: '°C',
    value: 'c',
    conversions: ['f', 'c', 'k'],
    type: UnitTypes.TEMPERATURE,
  },
  {
    label: 'K',
    value: 'k',
    conversions: ['f', 'c', 'k'],
    type: UnitTypes.TEMPERATURE,
  },
  // Volumetric flow rate
  // Sources:
  //  https://petroleumoffice.com/unitconverter/volume%20flow%20rate
  //  https://github.com/cognitedata/inso-toolbox/blob/master/inso_toolbox/units/units.py
  {
    label: 'm³/s',
    value: 'm3s',
    conversions: ['m3s', 'm3min', 'm3hr', 'm3d', 'bbld', 'mbbld', 'mmscfd'],
    type: UnitTypes.VOLUMETRIC_FLOW,
  },
  {
    label: 'm³/min',
    value: 'm3min',
    conversions: ['m3s', 'm3min', 'm3hr', 'm3d', 'bbld', 'mbbld', 'mmscfd'],
    type: UnitTypes.VOLUMETRIC_FLOW,
  },
  {
    label: 'm³/hr',
    value: 'm3hr',
    conversions: ['m3s', 'm3min', 'm3hr', 'm3d', 'bbld', 'mbbld', 'mmscfd'],
    type: UnitTypes.VOLUMETRIC_FLOW,
  },
  {
    label: 'm³/d',
    value: 'm3d',
    conversions: ['m3s', 'm3min', 'm3hr', 'm3d', 'bbld', 'mbbld', 'mmscfd'],
    type: UnitTypes.VOLUMETRIC_FLOW,
  },
  {
    label: 'bbl/d',
    value: 'bbld',
    conversions: ['m3s', 'm3min', 'm3hr', 'm3d', 'bbld', 'mbbld', 'mmscfd'],
    type: UnitTypes.VOLUMETRIC_FLOW,
  },
  {
    label: 'mbbl/d',
    value: 'mbbld',
    conversions: ['m3s', 'm3min', 'm3hr', 'm3d', 'bbld', 'mbbld', 'mmscfd'],
    type: UnitTypes.VOLUMETRIC_FLOW,
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
    type: UnitTypes.VOLUMETRIC_FLOW,
  },
];

export default units;
