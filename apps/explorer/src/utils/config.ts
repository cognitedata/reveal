import { AddModelOptions } from '@cognite/reveal';

const env = {
  env: process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development',
  dataModelStorage: {
    spaceName: 'demo',
    modelNameBuilding: 'Building',
    modelNamePerson: 'Person',
    modelNameRoom: 'Room',
    modelNameEquipment: 'Equipment',
  },
  projectModels: {
    'atlas-greenfield': {
      modelId: 3838447502587280,
      revisionId: 8081245322726425,
    },
    'discover-test-bluefield': {
      modelId: 2917764993669823,
      revisionId: 4809067008094381,
    },
  } as Record<string, AddModelOptions>,
};

export default env;
