import type { DefinitionMap } from '@cognite/simconfig-api-sdk/rtk';

export const FileExtensionToSimulator: Record<
  string,
  keyof DefinitionMap['type']['simulator']
> = {
  '.out': 'PROSPER',
};

export const Simulator: Record<
  keyof DefinitionMap['type']['simulator'],
  string
> = {
  UNKNOWN: 'Unknown',
  PROSPER: 'PROSPER',
};

export const UnitSystem = {
  OilField: 'Oil field units',
  // eslint-disable-next-line
  NorSI: 'Norwegian SI units',
  // eslint-disable-next-line
  CanSI: 'Canadian SI units',
  // eslint-disable-next-line
  GerSI: 'German SI units',
  // eslint-disable-next-line
  FreSI: 'French SI units',
  // eslint-disable-next-line
  LatSI: 'Latin SI units',
};

export const BoundaryCondition = {
  ResPress: 'Reservoir pressure',
  CGR: 'Condensate gas ratio',
  WGR: 'Water gas ratio',
  Skin: 'Skin',
  N2: 'Nitrogen content',
  ResTemp: 'Reservoir temperature',
  WellLen: 'Well length',
  ResPerm: 'Reservoir permeability',
  ResThick: 'Reservoir thickness',
};

export const DEFAULT_MODEL_SOURCE: keyof DefinitionMap['type']['simulator'] =
  'PROSPER';
export const DEFAULT_UNIT_SYSTEM: keyof DefinitionMap['type']['unitSystem'] =
  'OilField';
