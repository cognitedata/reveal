---
id: "cognite_reveal.CdfModelNodeCollectionDataProvider"
title: "Interface: CdfModelNodeCollectionDataProvider"
sidebar_label: "CdfModelNodeCollectionDataProvider"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).CdfModelNodeCollectionDataProvider

Provides metadata needed to get asset mappings for a CDF 3D model

## Implemented by

- [`Cognite3DModel`](../classes/cognite_reveal.Cognite3DModel.md)

## Properties

### mapBoxFromCdfToModelCoordinates

• **mapBoxFromCdfToModelCoordinates**: (`box`: `Box3`, `out?`: `Box3`) => `Box3`

#### Type declaration

▸ (`box`, `out?`): `Box3`

Maps a box from CDF space to Reveal space

##### Parameters

| Name | Type |
| :------ | :------ |
| `box` | `Box3` |
| `out?` | `Box3` |

##### Returns

`Box3`

#### Defined in

[packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:19](https://github.com/cognitedata/reveal/blob/8cfa4004b/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L19)

___

### mapBoxFromModelToCdfCoordinates

• **mapBoxFromModelToCdfCoordinates**: (`box`: `Box3`, `out?`: `Box3`) => `Box3`

#### Type declaration

▸ (`box`, `out?`): `Box3`

Maps a box from Reveal space to CDF space

##### Parameters

| Name | Type |
| :------ | :------ |
| `box` | `Box3` |
| `out?` | `Box3` |

##### Returns

`Box3`

#### Defined in

[packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:14](https://github.com/cognitedata/reveal/blob/8cfa4004b/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L14)

___

### modelId

• **modelId**: `number`

Model and revision IDs for the model

#### Defined in

[packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:29](https://github.com/cognitedata/reveal/blob/8cfa4004b/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L29)

___

### nodeCount

• **nodeCount**: `number`

Total count of nodes in the model

#### Defined in

[packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:24](https://github.com/cognitedata/reveal/blob/8cfa4004b/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L24)

___

### revisionId

• **revisionId**: `number`

#### Defined in

[packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts:30](https://github.com/cognitedata/reveal/blob/8cfa4004b/viewer/packages/cad-styling/src/CdfModelNodeCollectionDataProvider.ts#L30)
