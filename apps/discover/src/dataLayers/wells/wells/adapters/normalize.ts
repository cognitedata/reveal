import { Well } from 'modules/wellSearch/types';

export const normalize = (rawAPIWell: Well): Well => {
  return {
    ...rawAPIWell,
  };
};
