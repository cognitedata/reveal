# Class: AxisViewTool

Base class for tools attaching to a [Cognite3DViewer](../../classes/Cognite3DViewer.md).

## Extends

- [`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md)

## Constructors

### new AxisViewTool()

> **new AxisViewTool**(`viewer`, `config`?): [`AxisViewTool`](AxisViewTool.md)

#### Parameters

• **viewer**: [`Cognite3DViewer`](../../classes/Cognite3DViewer.md)

• **config?**: [`AxisBoxConfig`](../type-aliases/AxisBoxConfig.md)

#### Returns

[`AxisViewTool`](AxisViewTool.md)

#### Overrides

[`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md) . [`constructor`](Cognite3DViewerToolBase.md#constructors)

#### Defined in

[packages/tools/src/AxisView/AxisViewTool.ts:39](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/AxisView/AxisViewTool.ts#L39)

## Methods

### dispose()

> **dispose**(): `void`

Disposes the element and triggeres the 'disposed' event before clearing the list
of dipose-listeners.

#### Returns

`void`

#### Overrides

[`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md) . [`dispose`](Cognite3DViewerToolBase.md#dispose)

#### Defined in

[packages/tools/src/AxisView/AxisViewTool.ts:63](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/AxisView/AxisViewTool.ts#L63)

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
