# Class: AxisGizmoTool

**`Beta`**

Class for axis gizmo like the one in Blender

## Extends

- [`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md)

## Constructors

### new AxisGizmoTool()

> **new AxisGizmoTool**(`option`?): [`AxisGizmoTool`](AxisGizmoTool.md)

**`Beta`**

#### Parameters

• **option?**: [`AxisGizmoOptions`](AxisGizmoOptions.md)

#### Returns

[`AxisGizmoTool`](AxisGizmoTool.md)

#### Overrides

[`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md) . [`constructor`](Cognite3DViewerToolBase.md#constructors)

#### Defined in

[packages/tools/src/AxisGizmo/AxisGizmoTool.ts:48](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/AxisGizmo/AxisGizmoTool.ts#L48)

## Accessors

### options

> `get` **options**(): [`AxisGizmoOptions`](AxisGizmoOptions.md)

**`Beta`**

#### Returns

[`AxisGizmoOptions`](AxisGizmoOptions.md)

#### Defined in

[packages/tools/src/AxisGizmo/AxisGizmoTool.ts:100](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/AxisGizmo/AxisGizmoTool.ts#L100)

## Methods

### connect()

> **connect**(`viewer`): `void`

**`Beta`**

Connects the AxisGizmoTool to a Cognite3DViewer instance.

#### Parameters

• **viewer**: [`Cognite3DViewer`](../../classes/Cognite3DViewer.md)

The Cognite3DViewer instance to connect to.
Note: After it is connected to the viewer the tool can not be moved or
changed size by changing the fields: size, corner, yMargin and yMargin
in the AxisGizmoOptions

#### Returns

`void`

#### Defined in

[packages/tools/src/AxisGizmo/AxisGizmoTool.ts:84](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/AxisGizmo/AxisGizmoTool.ts#L84)

***

### dispose()

> **dispose**(): `void`

**`Beta`**

#### Returns

`void`

#### Overrides

[`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md) . [`dispose`](Cognite3DViewerToolBase.md#dispose)

#### Defined in

[packages/tools/src/AxisGizmo/AxisGizmoTool.ts:60](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/AxisGizmo/AxisGizmoTool.ts#L60)

***

### off()

> **off**(`event`, `handler`): `void`

**`Beta`**

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
