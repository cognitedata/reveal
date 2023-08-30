const baseUrl = 'https://publicdata.fusion.cognite.com';

const importMap = await fetch(`${baseUrl}/import-map.json`).then((res) =>
  res.json()
);

const subAppsImportMap = await fetch(
  `${baseUrl}/sub-apps-import-map.json`
).then((res) => res.json());

const mergedImportMap = {
  imports: {
    '@cognite/cdf-sdk-singleton':
      importMap.imports['@cognite/cdf-sdk-singleton'],
    '@cognite/cdf-route-tracker':
      importMap.imports['@cognite/cdf-route-tracker'],
    ...subAppsImportMap.imports,
  },
};

const updatedImportMap = {
  imports: Object.entries(mergedImportMap.imports).reduce(
    (prev, [key, path]) => {
      return {
        ...prev,
        [key]: baseUrl + path,
      };
    },
    {}
  ),
};

console.log(JSON.stringify(updatedImportMap, null, 2));
