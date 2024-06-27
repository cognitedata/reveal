# Type Alias: CadModelBudget

> **CadModelBudget**: `object`

Represents a measurement of how much geometry can be loaded.

## Type declaration

### ~~highDetailProximityThreshold~~

> `readonly` **highDetailProximityThreshold**: `number`

Sectors within this distance from the camera will always be loaded in high details.

#### Deprecated

This is only used for 3D models processed prior to the Reveal 3.0 release (Q1 2022).

### maximumRenderCost

> `readonly` **maximumRenderCost**: `number`

Maximum render cost. This number can be thought of as triangle count, although the number
doesn't match this directly.

## Defined in

[packages/cad-geometry-loaders/src/CadModelBudget.ts:10](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-geometry-loaders/src/CadModelBudget.ts#L10)
