---
id: "cognite_reveal.CogniteModelBase"
title: "Interface: CogniteModelBase"
sidebar_label: "CogniteModelBase"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).CogniteModelBase

## Implemented by

- [`Cognite3DModel`](../classes/cognite_reveal.Cognite3DModel.md)
- [`CognitePointCloudModel`](../classes/cognite_reveal.CognitePointCloudModel.md)

## Properties

### type

• `Readonly` **type**: [`SupportedModelTypes`](../modules/cognite_reveal.md#supportedmodeltypes)

#### Defined in

[packages/model-base/src/CogniteModelBase.ts:13](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/model-base/src/CogniteModelBase.ts#L13)

## Methods

### dispose

▸ **dispose**(): `void`

#### Returns

`void`

#### Defined in

[packages/model-base/src/CogniteModelBase.ts:14](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/model-base/src/CogniteModelBase.ts#L14)

___

### getCameraConfiguration

▸ **getCameraConfiguration**(): [`CameraConfiguration`](../modules/cognite_reveal.md#cameraconfiguration)

#### Returns

[`CameraConfiguration`](../modules/cognite_reveal.md#cameraconfiguration)

#### Defined in

[packages/model-base/src/CogniteModelBase.ts:16](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/model-base/src/CogniteModelBase.ts#L16)

___

### getModelBoundingBox

▸ **getModelBoundingBox**(`outBbox?`, `restrictToMostGeometry?`): `Box3`

#### Parameters

| Name | Type |
| :------ | :------ |
| `outBbox?` | `Box3` |
| `restrictToMostGeometry?` | `boolean` |

#### Returns

`Box3`

#### Defined in

[packages/model-base/src/CogniteModelBase.ts:15](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/model-base/src/CogniteModelBase.ts#L15)

___

### getModelTransformation

▸ **getModelTransformation**(`out?`): `Matrix4`

#### Parameters

| Name | Type |
| :------ | :------ |
| `out?` | `Matrix4` |

#### Returns

`Matrix4`

#### Defined in

[packages/model-base/src/CogniteModelBase.ts:18](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/model-base/src/CogniteModelBase.ts#L18)

___

### setModelTransformation

▸ **setModelTransformation**(`matrix`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `matrix` | `Matrix4` |

#### Returns

`void`

#### Defined in

[packages/model-base/src/CogniteModelBase.ts:17](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/model-base/src/CogniteModelBase.ts#L17)
