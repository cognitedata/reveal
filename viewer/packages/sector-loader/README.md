# Sector Loader
The sector loader package is intended to be used for loading a given sector defined by the `WantedSector` type from `@reveal/cad-parsers` package.
The result will be of type `ConsumedSector` which contains all the given geometry for the sector. 
This package is responsible for fetching the sector (remote, local, cache, etc.) and feeding the data to a parser and packaging the result for usage in a scene.


The facade of this package is as follows:
```ts
export interface SectorRepository {
  loadSector(sector: WantedSector): Promise<ConsumedSector>;
  clear(): void;
}
```

The package contains two implementations for this facade: 
- `V8SectorRepository`: i3d/f3d/ctm outputs
- `GltfSectorRepository`: for Gltf-binary outputs


Definitions for type dependencies: `WantedSector` and `ConsumedSector` from `@reveal/cad-parsers` can be viewed [here](https://github.com/cognitedata/reveal/blob/master/viewer/packages/cad-parsers/src/cad/types.ts).


## Sector loader test app
The `/app/` folder contains a test app which can be used to test the sector parser in a browser context. The app can be started by running `yarn start` in the package root.
The app will automatically load any and all sector files located in the `/test-models/` directory. Note that the test app has no concept of where the geometry is so you might have to change the camera position / target.

The app is by default hooked up with the `3d-test` CDF project and will default to loading a simple scene.
You may also specify `modelId` and `revisionId` as url paramaters to specify a given model. 
Note that the test app will attempt to load the entire model.

The app also contains a simple UI that allows you to switch the model type between GLTF and i3d/f3d.

Example URL:
```
https://localhost:8080?modelId=1791160622840317&revisionId=502149125550840
```
