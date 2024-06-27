# Class: Overlay3DTool\<ContentType\>

Tool for adding and interacting with 2D overlays positioned at points in

## Extends

- [`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md)

## Type Parameters

• **ContentType** = [`DefaultOverlay3DContentType`](../../type-aliases/DefaultOverlay3DContentType.md)

## Constructors

### new Overlay3DTool()

> **new Overlay3DTool**\<`ContentType`\>(`viewer`, `toolParameters`?): [`Overlay3DTool`](Overlay3DTool.md)\<`ContentType`\>

#### Parameters

• **viewer**: [`Cognite3DViewer`](../../classes/Cognite3DViewer.md)

• **toolParameters?**: [`Overlay3DToolParameters`](../type-aliases/Overlay3DToolParameters.md)

#### Returns

[`Overlay3DTool`](Overlay3DTool.md)\<`ContentType`\>

#### Overrides

[`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md) . [`constructor`](Cognite3DViewerToolBase.md#constructors)

#### Defined in

[packages/tools/src/Overlay3D/Overlay3DTool.ts:97](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Overlay3D/Overlay3DTool.ts#L97)

## Methods

### clear()

> **clear**(): `void`

Removes all overlays.

#### Returns

`void`

#### Defined in

[packages/tools/src/Overlay3D/Overlay3DTool.ts:193](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Overlay3D/Overlay3DTool.ts#L193)

***

### createOverlayCollection()

> **createOverlayCollection**(`overlays`?, `options`?): [`OverlayCollection`](../../interfaces/OverlayCollection.md)\<`ContentType`\>

Creates new OverlayCollection.

#### Parameters

• **overlays?**: [`OverlayInfo`](../../type-aliases/OverlayInfo.md)\<`ContentType`\>[]

Array of overlays to add.

• **options?**: [`OverlayCollectionOptions`](../type-aliases/OverlayCollectionOptions.md)

#### Returns

[`OverlayCollection`](../../interfaces/OverlayCollection.md)\<`ContentType`\>

Overlay group containing it's id.

#### Defined in

[packages/tools/src/Overlay3D/Overlay3DTool.ts:114](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Overlay3D/Overlay3DTool.ts#L114)

***

### dispose()

> **dispose**(): `void`

Dispose of resources used by this tool

#### Returns

`void`

#### Overrides

[`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md) . [`dispose`](Cognite3DViewerToolBase.md#dispose)

#### Defined in

[packages/tools/src/Overlay3D/Overlay3DTool.ts:249](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Overlay3D/Overlay3DTool.ts#L249)

***

### getCollections()

> **getCollections**(): [`OverlayCollection`](../../interfaces/OverlayCollection.md)\<`ContentType`\>[]

Gets all added overlay collections.

#### Returns

[`OverlayCollection`](../../interfaces/OverlayCollection.md)\<`ContentType`\>[]

#### Defined in

[packages/tools/src/Overlay3D/Overlay3DTool.ts:152](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Overlay3D/Overlay3DTool.ts#L152)

***

### getTextOverlayVisible()

> **getTextOverlayVisible**(): `boolean`

Gets whether text overlay is visible.

#### Returns

`boolean`

#### Defined in

[packages/tools/src/Overlay3D/Overlay3DTool.ts:186](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Overlay3D/Overlay3DTool.ts#L186)

***

### getVisible()

> **getVisible**(): `boolean`

Gets whether overlays are visible.

#### Returns

`boolean`

#### Defined in

[packages/tools/src/Overlay3D/Overlay3DTool.ts:171](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Overlay3D/Overlay3DTool.ts#L171)

***

### off()

#### off(event, eventHandler)

> **off**(`event`, `eventHandler`): `void`

Unregisters an event handler for the 'disposed'-event.

##### Parameters

• **event**: `"hover"`

• **eventHandler**: [`OverlayEventHandler`](../type-aliases/OverlayEventHandler.md)\<`ContentType`\>

##### Returns

`void`

##### Overrides

[`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md) . [`off`](Cognite3DViewerToolBase.md#off)

##### Defined in

[packages/tools/src/Overlay3D/Overlay3DTool.ts:226](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Overlay3D/Overlay3DTool.ts#L226)

#### off(event, eventHandler)

> **off**(`event`, `eventHandler`): `void`

##### Parameters

• **event**: `"click"`

• **eventHandler**: [`OverlayEventHandler`](../type-aliases/OverlayEventHandler.md)\<`ContentType`\>

##### Returns

`void`

##### Overrides

`Cognite3DViewerToolBase.off`

##### Defined in

[packages/tools/src/Overlay3D/Overlay3DTool.ts:227](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Overlay3D/Overlay3DTool.ts#L227)

#### off(event, eventHandler)

> **off**(`event`, `eventHandler`): `void`

##### Parameters

• **event**: `"disposed"`

• **eventHandler**: [`DisposedDelegate`](../../type-aliases/DisposedDelegate.md)

##### Returns

`void`

##### Overrides

`Cognite3DViewerToolBase.off`

##### Defined in

[packages/tools/src/Overlay3D/Overlay3DTool.ts:228](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Overlay3D/Overlay3DTool.ts#L228)

***

### on()

#### on(event, eventHandler)

> **on**(`event`, `eventHandler`): `void`

Subscribes to overlay events.

##### Parameters

• **event**: `"hover"`

event to subscribe to.

• **eventHandler**: [`OverlayEventHandler`](../type-aliases/OverlayEventHandler.md)\<`ContentType`\>

##### Returns

`void`

##### Overrides

`Cognite3DViewerToolBase.on`

##### Defined in

[packages/tools/src/Overlay3D/Overlay3DTool.ts:206](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Overlay3D/Overlay3DTool.ts#L206)

#### on(event, eventHandler)

> **on**(`event`, `eventHandler`): `void`

##### Parameters

• **event**: `"click"`

• **eventHandler**: [`OverlayEventHandler`](../type-aliases/OverlayEventHandler.md)\<`ContentType`\>

##### Returns

`void`

##### Overrides

`Cognite3DViewerToolBase.on`

##### Defined in

[packages/tools/src/Overlay3D/Overlay3DTool.ts:207](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Overlay3D/Overlay3DTool.ts#L207)

#### on(event, eventHandler)

> **on**(`event`, `eventHandler`): `void`

##### Parameters

• **event**: `"disposed"`

• **eventHandler**: [`DisposedDelegate`](../../type-aliases/DisposedDelegate.md)

##### Returns

`void`

##### Overrides

`Cognite3DViewerToolBase.on`

##### Defined in

[packages/tools/src/Overlay3D/Overlay3DTool.ts:208](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Overlay3D/Overlay3DTool.ts#L208)

***

### removeOverlayCollection()

> **removeOverlayCollection**(`overlayCollection`): `void`

Removes overlays that were added with addOverlays method.

#### Parameters

• **overlayCollection**: [`OverlayCollection`](../../interfaces/OverlayCollection.md)\<`ContentType`\>

Id of the overlay group to remove.

#### Returns

`void`

#### Defined in

[packages/tools/src/Overlay3D/Overlay3DTool.ts:137](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Overlay3D/Overlay3DTool.ts#L137)

***

### setTextOverlayVisible()

> **setTextOverlayVisible**(`visible`): `void`

Sets whether text overlay is visible.
Default is false.

#### Parameters

• **visible**: `boolean`

#### Returns

`void`

#### Defined in

[packages/tools/src/Overlay3D/Overlay3DTool.ts:179](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Overlay3D/Overlay3DTool.ts#L179)

***

### setVisible()

> **setVisible**(`visible`): `void`

Sets whether overlays are visible.

#### Parameters

• **visible**: `boolean`

#### Returns

`void`

#### Defined in

[packages/tools/src/Overlay3D/Overlay3DTool.ts:159](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Overlay3D/Overlay3DTool.ts#L159)
