---
id: "cognite_reveal.NodeAppearanceProvider"
title: "Class: NodeAppearanceProvider"
sidebar_label: "NodeAppearanceProvider"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).NodeAppearanceProvider

## Constructors

### constructor

• **new NodeAppearanceProvider**()

## Accessors

### isLoading

• `get` **isLoading**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:155](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L155)

## Methods

### applyStyles

▸ **applyStyles**(`applyCb`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `applyCb` | `ApplyStyleDelegate` |

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:118](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L118)

___

### assignStyledNodeCollection

▸ **assignStyledNodeCollection**(`nodeCollection`, `appearance`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [`NodeCollection`](cognite_reveal.NodeCollection.md) |
| `appearance` | [`NodeAppearance`](../modules/cognite_reveal.md#nodeappearance) |

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:82](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L82)

___

### clear

▸ **clear**(): `void`

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:146](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L146)

___

### getPrioritizedAreas

▸ **getPrioritizedAreas**(): `PrioritizedArea`[]

#### Returns

`PrioritizedArea`[]

#### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:125](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L125)

___

### off

▸ **off**(`event`, `listener`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:60](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L60)

▸ **off**(`event`, `listener`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"loadingStateChanged"`` |
| `listener` | (`isLoading`: `boolean`) => `void` |

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:61](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L61)

___

### on

▸ **on**(`event`, `listener`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"changed"`` |
| `listener` | () => `void` |

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:37](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L37)

▸ **on**(`event`, `listener`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"loadingStateChanged"`` |
| `listener` | (`isLoading`: `boolean`) => `void` |

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:38](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L38)

▸ **on**(`event`, `listener`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"prioritizedAreasChanged"`` |
| `listener` | () => `void` |

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:39](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L39)

___

### unassignStyledNodeCollection

▸ **unassignStyledNodeCollection**(`nodeCollection`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodeCollection` | [`NodeCollection`](cognite_reveal.NodeCollection.md) |

#### Returns

`void`

#### Defined in

[packages/cad-styling/src/NodeAppearanceProvider.ts:106](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/cad-styling/src/NodeAppearanceProvider.ts#L106)
