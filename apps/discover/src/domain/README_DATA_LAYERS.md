We need to have a Data Layer which sits in between the fetch & UI presentation component.

- Data Layer will consist of all the data domain logic required to be passed to any components.
- Structure the data layer folder so it follows the `service` folder structure
- Data Layer folder will be divided into adapters, decorators & selectors

- Domain Components (eg: in pages) should have 2 hook calls ( useData & useDataLayer(data) )
- `useData.ts` will grab the raw data from `services` or `modules` (formerly: just modules)
- `useDataLayer.ts` will have the responsibility to call any combination of adapters/decorators to manipulate data and provide data in whatever format is required by the presentation component.

Example structure

- adapters
  -- Manipulate the data (normalization after query, or for repeated views, e.g unit conversion)
- decorators
  -- Merge/enrich data (e.g add color to a trajectory)
- selectors
  -- Select data from a structure. (e.g: getTitle, getWellboreName, etc)
