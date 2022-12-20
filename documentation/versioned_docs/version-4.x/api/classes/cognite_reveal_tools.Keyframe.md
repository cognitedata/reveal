---
id: "cognite_reveal_tools.Keyframe"
title: "Class: Keyframe"
sidebar_label: "Keyframe"
custom_edit_url: null
---

[@cognite/reveal/tools](../modules/cognite_reveal_tools.md).Keyframe

Timeline Key Frames contains parameters to access Nodes, Styles for the Timeline

## Constructors

### constructor

• **new Keyframe**(`model`, `date`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `model` | [`CogniteCadModel`](cognite_reveal.CogniteCadModel.md) |
| `date` | `Date` |

#### Defined in

[packages/tools/src/Timeline/Keyframe.ts:17](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Timeline/Keyframe.ts#L17)

## Methods

### activate

▸ **activate**(): `void`

Assigns the styles for the node set for the model for this Keyframe

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/Keyframe.ts:33](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Timeline/Keyframe.ts#L33)

___

### assignStyledNodeCollection

▸ **assignStyledNodeCollection**(`nodeCollection`, `nodeAppearance`): `void`

Add node & style to the collection. If the collection has been added, the style is updated to the
appearance provided.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeCollection` | [`NodeCollection`](cognite_reveal.NodeCollection.md) | Node set to apply the Styles |
| `nodeAppearance` | [`NodeAppearance`](../modules/cognite_reveal.md#nodeappearance) | Style to assign to the node collection |

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/Keyframe.ts:54](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Timeline/Keyframe.ts#L54)

___

### deactivate

▸ **deactivate**(): `void`

Removes the style for the model

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/Keyframe.ts:42](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Timeline/Keyframe.ts#L42)

___

### getKeyframeDate

▸ **getKeyframeDate**(): `Date`

Get date of the Keyframe

#### Returns

`Date`

date

#### Defined in

[packages/tools/src/Timeline/Keyframe.ts:26](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Timeline/Keyframe.ts#L26)

___

### unassignStyledNodeCollection

▸ **unassignStyledNodeCollection**(`nodeCollection`): `void`

Remove Node & Style for this keyframe's nodeCollection and nodeAppearance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodeCollection` | [`NodeCollection`](cognite_reveal.NodeCollection.md) | Nodes to be unassign from node collection |

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/Keyframe.ts:69](https://github.com/cognitedata/reveal/blob/fba2eed2/viewer/packages/tools/src/Timeline/Keyframe.ts#L69)
