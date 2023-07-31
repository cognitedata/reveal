import { CasingAssemblyInternal } from '../types';

type CasingType = Pick<CasingAssemblyInternal, 'type'>;

export const isLiner = <T extends CasingType>(casingAssembly: T) => {
  const { type } = casingAssembly;

  if (!type) {
    return false;
  }

  return type.toLowerCase().includes('liner');
};
