import { FeatureModule, FeatureModuleConfig } from './types';

/**
 * Used to lazy load modules and lazy load redux store
 * Do not move from here
 */
export const lazyLoadModules = (
  store: any,
  modulePaths: FeatureModuleConfig[]
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const promises = modulePaths
      .filter((config) => config.enabled)
      .map((featureModule) => import(`./${featureModule.path}`));
    Promise.all(promises)
      .then((modules) => {
        modules.forEach((module: FeatureModule) => {
          module.init();

          // eslint-disable-next-line
          if (typeof module.initStore === 'function' && module.moduleName) {
            const moduleStore = module.initStore();

            (store as any).injectReducer(module.moduleName, moduleStore);
          }
        });

        resolve(true);
      })
      .catch((err) => reject(err));
  });
};
