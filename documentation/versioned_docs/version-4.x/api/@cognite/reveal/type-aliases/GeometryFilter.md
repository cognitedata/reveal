# Type Alias: GeometryFilter

> **GeometryFilter**: `object`

## Type declaration

### boundingBox?

> `optional` **boundingBox**: `Box3`

The bounds to load geometry within. By default this box is in CDF coordinate space which
will be transformed into coordinates relative to the model using the the model transformation
which can be specified using [the CDF API](https://docs.cognite.com/api/v1/#operation/update3DRevisions),
or set in [Cognite Fusion](https://fusion.cognite.com/).

#### See

GeometryFilter.isBoundingBoxInModelCoordinates.

### isBoundingBoxInModelCoordinates?

> `optional` **isBoundingBoxInModelCoordinates**: `boolean`

When set, the geometry filter `boundingBox` will be considered to be in "Reveal/ThreeJS space".
Rather than CDF space which is the default. When using Reveal space, the model transformation
which can be specified using [the CDF API](https://docs.cognite.com/api/v1/#operation/update3DRevisions),
or set in [Cognite Fusion](https://fusion.cognite.com/).

## Defined in

[packages/cad-model/src/types.ts:24](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-model/src/types.ts#L24)
