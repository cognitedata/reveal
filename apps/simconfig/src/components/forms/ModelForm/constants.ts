import type { DefinitionMap } from '@cognite/simconfig-api-sdk/rtk';

// TODO(SIM-209) Migrate to definitions endpoint
export const FileExtensionToSimulator: Record<
  string,
  keyof DefinitionMap['type']['simulator']
> = {
  '.out': 'PROSPER',
};

// TODO(SIM-209) Use definitions endpoint
export const Simulator: Record<
  keyof DefinitionMap['type']['simulator'],
  string
> = {
  UNKNOWN: 'Unknown',
  PROSPER: 'PROSPER',
};

// TODO(SIM-209) Use definitions endpoint
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

// TODO(SIM-209) Use definitions endpoint
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

// TODO(SIM-209) Use definitions endpoint
export const DEFAULT_MODEL_SOURCE: keyof DefinitionMap['type']['simulator'] =
  'PROSPER';
// TODO(SIM-209) Use definitions endpoint
export const DEFAULT_UNIT_SYSTEM: keyof DefinitionMap['type']['unitSystem'] =
  'OilField';
