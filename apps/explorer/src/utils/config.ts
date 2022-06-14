import { AddModelOptions } from '@cognite/reveal';

const env = {
  env: process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development',
  projectModels: {
    'atlas-greenfield': {
      modelId: 3838447502587280,
      revisionId: 8081245322726425,
    },
  } as Record<string, AddModelOptions>,
};

export default env;
