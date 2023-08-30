import { useQuery } from '@tanstack/react-query';

export const useImportMapApps = () =>
  useQuery(['import-map', 'apps'], async () => {
    const subAppsImportMap = await fetch('/subapps-import-map.json')
      .then((r) => r.json())
      .then((map) => Object.keys(map.imports || {}));

    return subAppsImportMap;
  });
