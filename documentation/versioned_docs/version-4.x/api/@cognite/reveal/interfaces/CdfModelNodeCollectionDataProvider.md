# Interface: CdfModelNodeCollectionDataProvider

Provides metadata needed to get asset mappings for a CDF 3D model

## Properties

### modelId

> **modelId**: `number`

Model and revision IDs for the model

#### Defined in

[packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:31](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L31)

***

### nodeCount

> **nodeCount**: `number`

Total count of nodes in the model

#### Defined in

[packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:26](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L26)

***

### revisionId

> **revisionId**: `number`

#### Defined in

[packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:32](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L32)

## Methods

### getCdfToDefaultModelTransformation()

> **getCdfToDefaultModelTransformation**(`out`?): `Matrix4`

Gets the default transformation of the model from CDF space.
The current total transformation of the model from the backend to its transform in ThreeJS space
is thus `model.getCdfToDefaultModelTransformation() * model.getModelTransformation()`.

#### Parameters

• **out?**: `Matrix4`

#### Returns

`Matrix4`

#### Defined in

[packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:21](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L21)

***

### getModelTransformation()

> **getModelTransformation**(`out`?): `Matrix4`

Gets the transformation of the model in ThreeJS space

#### Parameters

• **out?**: `Matrix4`

#### Returns

`Matrix4`

#### Defined in

[packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:14](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L14)
