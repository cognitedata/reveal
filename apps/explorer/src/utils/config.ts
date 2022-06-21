import { AddModelOptions } from '@cognite/reveal';

const env = {
  env: process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development',
  projectModels: {
    'discover-test-bluefield': {
      modelId: 2917764993669823,
      revisionId: 4809067008094381,
    },
  } as Record<string, AddModelOptions>,
};

export default env;
