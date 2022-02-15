We need to have a Data Layer which sits in between the fetch & UI presentation component.

- Data Layer will consist of all the domain logic required to be passed to the component.
- Structure the data layer folder so it follows the `service` folder structure
- Data Layer folder will be divided into adapters, decorators & selectors for now.

- Adapters are where all the existing data is formatted in different structures. (e.g unit conversion)
- Decorators are where you add data on existing data.

- Domain Components (eg: in pages) should have 2 hook calls ( useData & useDataLayer(data) )
- `useData.ts` will grab the raw data from `services` or `modules` (formerly: just modules)
- `useDataLayer.ts` will have the responsibility to call any combination of adapters/decorators to manipulate data and provide data in whatever format is required by the presentation component.

Example structure

- wells
  - trajectories
    - adapters
      -- Add files here which manipulates the data (normalization and transformations)
    - decorators
      -- Merge/enrich data (e.g add color to an existing object)
    - selectors
      -- Select data from a structure. (e.g: getTitle, getWellboreName, etc)
