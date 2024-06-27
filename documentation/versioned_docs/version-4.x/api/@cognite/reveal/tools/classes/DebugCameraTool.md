# Class: DebugCameraTool

Base class for tools attaching to a [Cognite3DViewer](../../classes/Cognite3DViewer.md).

## Extends

- [`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md)

## Constructors

### new DebugCameraTool()

> **new DebugCameraTool**(`viewer`): [`DebugCameraTool`](DebugCameraTool.md)

#### Parameters

• **viewer**: [`Cognite3DViewer`](../../classes/Cognite3DViewer.md)

#### Returns

[`DebugCameraTool`](DebugCameraTool.md)

#### Overrides

[`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md) . [`constructor`](Cognite3DViewerToolBase.md#constructors)

#### Defined in

[packages/tools/src/DebugCameraTool.ts:20](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/DebugCameraTool.ts#L20)

## Methods

### dispose()

> **dispose**(): `void`

**`Override`**

Removes all elements and detaches from the viewer.

#### Returns

`void`

#### Overrides

[`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md) . [`dispose`](Cognite3DViewerToolBase.md#dispose)

#### Defined in

[packages/tools/src/DebugCameraTool.ts:32](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/DebugCameraTool.ts#L32)

***

### hideCameraHelper()

> **hideCameraHelper**(): `void`

#### Returns

`void`

#### Defined in

[packages/tools/src/DebugCameraTool.ts:43](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/DebugCameraTool.ts#L43)

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

### showCameraHelper()

> **showCameraHelper**(): `void`

#### Returns

`void`

#### Defined in

[packages/tools/src/DebugCameraTool.ts:37](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/DebugCameraTool.ts#L37)
