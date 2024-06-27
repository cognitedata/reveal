# Class: TimelineTool

Tool to applying styles to nodes based on date to play them over in Timeline

## Extends

- [`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md)

## Constructors

### new TimelineTool()

> **new TimelineTool**(`cadModel`): [`TimelineTool`](TimelineTool.md)

#### Parameters

• **cadModel**: [`CogniteCadModel`](../../classes/CogniteCadModel.md)

#### Returns

[`TimelineTool`](TimelineTool.md)

#### Overrides

[`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md) . [`constructor`](Cognite3DViewerToolBase.md#constructors)

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:22](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Timeline/TimelineTool.ts#L22)

## Methods

### createKeyframe()

> **createKeyframe**(`date`): [`Keyframe`](Keyframe.md)

Create Key frame for the Timeline

#### Parameters

• **date**: `Date`

date value by Date.now() since January 1, 1970

#### Returns

[`Keyframe`](Keyframe.md)

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:63](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Timeline/TimelineTool.ts#L63)

***

### dispose()

> **dispose**(): `void`

Disposes the element and triggeres the 'disposed' event before clearing the list
of dipose-listeners.

#### Returns

`void`

#### Overrides

[`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md) . [`dispose`](Cognite3DViewerToolBase.md#dispose)

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:184](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Timeline/TimelineTool.ts#L184)

***

### getAllKeyframes()

> **getAllKeyframes**(): [`Keyframe`](Keyframe.md)[]

Provides all Keyframes in the Timeline

#### Returns

[`Keyframe`](Keyframe.md)[]

All Keyframes in Timeline

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:180](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Timeline/TimelineTool.ts#L180)

***

### getKeyframeByDate()

> **getKeyframeByDate**(`date`): `undefined` \| [`Keyframe`](Keyframe.md)

Returns the keyframe at the date given, or undefined if not found.

#### Parameters

• **date**: `Date`

#### Returns

`undefined` \| [`Keyframe`](Keyframe.md)

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:76](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Timeline/TimelineTool.ts#L76)

***

### off()

> **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

#### Parameters

• **event**: `"disposed"`

• **handler**

#### Returns

`void`

#### Inherited from

[`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md) . [`off`](Cognite3DViewerToolBase.md#off)

#### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:38](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L38)

***

### pause()

> **pause**(): `void`

Pause any ongoing playback

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:161](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Timeline/TimelineTool.ts#L161)

***

### play()

> **play**(`startDate`, `endDate`, `totalDurationInMilliSeconds`): `void`

Starts playback of Timeline

#### Parameters

• **startDate**: `Date`

Keyframe date to start the Playback of Keyframes

• **endDate**: `Date`

Keyframe date to stop the Playback of Keyframes

• **totalDurationInMilliSeconds**: `number`

Number of milliseconds for all Keyframe within startDate & endDate to be rendered

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:110](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Timeline/TimelineTool.ts#L110)

***

### removeKeyframe()

> **removeKeyframe**(`keyframe`): `void`

Removes the Keyframe from the timeline. Does nothing if the keyframe isn't part of the timeline.

#### Parameters

• **keyframe**: [`Keyframe`](Keyframe.md)

Keyframe to be removed from the timeline

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:84](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Timeline/TimelineTool.ts#L84)

***

### removeKeyframeByDate()

> **removeKeyframeByDate**(`date`): `void`

Removes the Keyframe from the Timeline

#### Parameters

• **date**: `Date`

Date of the Keyframe to be removed from the Timeline

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:96](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Timeline/TimelineTool.ts#L96)

***

### resume()

> **resume**(): `void`

Resume any paused playback

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:170](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Timeline/TimelineTool.ts#L170)

***

### stop()

> **stop**(): `void`

Stops any ongoing playback

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:151](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Timeline/TimelineTool.ts#L151)

***

### subscribe()

> **subscribe**(`event`, `listener`): `void`

Subscribe to the Date changed event

#### Parameters

• **event**: `"dateChanged"`

`dateChanged` event

• **listener**: [`TimelineDateUpdateDelegate`](../type-aliases/TimelineDateUpdateDelegate.md)

Listen to Timeline date Update during Playback

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:34](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Timeline/TimelineTool.ts#L34)

***

### unsubscribe()

> **unsubscribe**(`event`, `listener`): `void`

Unsubscribe to the Date changed event

#### Parameters

• **event**: `"dateChanged"`

`dateChanged` event

• **listener**: [`TimelineDateUpdateDelegate`](../type-aliases/TimelineDateUpdateDelegate.md)

Remove Listen to Timeline date Update

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/TimelineTool.ts:49](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Timeline/TimelineTool.ts#L49)
