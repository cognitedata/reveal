import type { DefinitionMap } from '@cognite/simconfig-api-sdk/rtk';

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
