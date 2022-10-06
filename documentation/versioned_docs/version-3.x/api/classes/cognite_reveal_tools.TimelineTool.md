---
id: "cognite_reveal_tools.TimelineTool"
title: "Class: TimelineTool"
sidebar_label: "TimelineTool"
custom_edit_url: null
---

[@cognite/reveal/tools](../modules/cognite_reveal_tools.md).TimelineTool

Tool to applying styles to nodes based on date to play them over in Timeline

## Hierarchy

- [`Cognite3DViewerToolBase`](cognite_reveal_tools.Cognite3DViewerToolBase.md)

  ↳ **`TimelineTool`**

## Constructors

### constructor

• **new TimelineTool**(`cadModel`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `cadModel` | [`Cognite3DModel`](cognite_reveal.Cognite3DModel.md) |

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[constructor](cognite_reveal_tools.Cognite3DViewerToolBase.md#constructor)

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:22](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Timeline/TimelineTool.ts#L22)

## Methods

### createKeyframe

▸ **createKeyframe**(`date`): [`Keyframe`](cognite_reveal_tools.Keyframe.md)

Create Key frame for the Timeline

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `date` | `Date` | date value by Date.now() since January 1, 1970 |

#### Returns

[`Keyframe`](cognite_reveal_tools.Keyframe.md)

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:63](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Timeline/TimelineTool.ts#L63)

___

### dispose

▸ **dispose**(): `void`

Disposes the element and triggeres the 'disposed' event before clearing the list
of dipose-listeners.

#### Returns

`void`

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[dispose](cognite_reveal_tools.Cognite3DViewerToolBase.md#dispose)

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:184](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Timeline/TimelineTool.ts#L184)

___

### getAllKeyframes

▸ **getAllKeyframes**(): [`Keyframe`](cognite_reveal_tools.Keyframe.md)[]

Provides all Keyframes in the Timeline

#### Returns

[`Keyframe`](cognite_reveal_tools.Keyframe.md)[]

All Keyframes in Timeline

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:180](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Timeline/TimelineTool.ts#L180)

___

### getKeyframeByDate

▸ **getKeyframeByDate**(`date`): [`Keyframe`](cognite_reveal_tools.Keyframe.md)

Returns the keyframe at the date given, or undefined if not found.

#### Parameters

| Name | Type |
| :------ | :------ |
| `date` | `Date` |

#### Returns

[`Keyframe`](cognite_reveal_tools.Keyframe.md)

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:76](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Timeline/TimelineTool.ts#L76)

___

### off

▸ **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `handler` | () => `void` |

#### Returns

`void`

#### Inherited from

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[off](cognite_reveal_tools.Cognite3DViewerToolBase.md#off)

#### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:37](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L37)

___

### pause

▸ **pause**(): `void`

Pause any ongoing playback

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:161](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Timeline/TimelineTool.ts#L161)

___

### play

▸ **play**(`startDate`, `endDate`, `totalDurationInMilliSeconds`): `void`

Starts playback of Timeline

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `startDate` | `Date` | Keyframe date to start the Playback of Keyframes |
| `endDate` | `Date` | Keyframe date to stop the Playback of Keyframes |
| `totalDurationInMilliSeconds` | `number` | Number of milliseconds for all Keyframe within startDate & endDate to be rendered |

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:110](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Timeline/TimelineTool.ts#L110)

___

### removeKeyframe

▸ **removeKeyframe**(`keyframe`): `void`

Removes the Keyframe from the timeline. Does nothing if the keyframe isn't part of the timeline.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `keyframe` | [`Keyframe`](cognite_reveal_tools.Keyframe.md) | Keyframe to be removed from the timeline |

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:84](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Timeline/TimelineTool.ts#L84)

___

### removeKeyframeByDate

▸ **removeKeyframeByDate**(`date`): `void`

Removes the Keyframe from the Timeline

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `date` | `Date` | Date of the Keyframe to be removed from the Timeline |

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:96](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Timeline/TimelineTool.ts#L96)

___

### resume

▸ **resume**(): `void`

Resume any paused playback

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:170](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Timeline/TimelineTool.ts#L170)

___

### stop

▸ **stop**(): `void`

Stops any ongoing playback

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:151](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Timeline/TimelineTool.ts#L151)

___

### subscribe

▸ **subscribe**(`event`, `listener`): `void`

Subscribe to the Date changed event

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"dateChanged"`` | `dateChanged` event |
| `listener` | [`TimelineDateUpdateDelegate`](../modules/cognite_reveal_tools.md#timelinedateupdatedelegate) | Listen to Timeline date Update during Playback |

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:34](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Timeline/TimelineTool.ts#L34)

___

### unsubscribe

▸ **unsubscribe**(`event`, `listener`): `void`

Unsubscribe to the Date changed event

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"dateChanged"`` | `dateChanged` event |
| `listener` | [`TimelineDateUpdateDelegate`](../modules/cognite_reveal_tools.md#timelinedateupdatedelegate) | Remove Listen to Timeline date Update |

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:49](https://github.com/cognitedata/reveal/blob/71be00fcc/viewer/packages/tools/src/Timeline/TimelineTool.ts#L49)
