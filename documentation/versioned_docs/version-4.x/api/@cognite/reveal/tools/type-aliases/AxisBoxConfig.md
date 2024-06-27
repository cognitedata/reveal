# Type Alias: AxisBoxConfig

> **AxisBoxConfig**: `object`

Configuration of [AxisViewTool](../classes/AxisViewTool.md).

## Type declaration

### animationSpeed?

> `optional` **animationSpeed**: `number`

How long the camera animation lasts when
clicking a face of the orientation box.

### compass?

> `optional` **compass**: [`AxisBoxCompassConfig`](AxisBoxCompassConfig.md)

Configuration of the compass "base" of the tool.

### faces?

> `optional` **faces**: `object`

Configuration for each of the faces of the orientation box.
Note that Reveal uses a right-handed Y up coordinate system,
which might differ from the original model space. To account
for this, you might want to reassign labels of the faces.

### faces.xNegativeFace?

> `optional` **xNegativeFace**: [`AxisBoxFaceConfig`](AxisBoxFaceConfig.md)

### faces.xPositiveFace?

> `optional` **xPositiveFace**: [`AxisBoxFaceConfig`](AxisBoxFaceConfig.md)

### faces.yNegativeFace?

> `optional` **yNegativeFace**: [`AxisBoxFaceConfig`](AxisBoxFaceConfig.md)

### faces.yPositiveFace?

> `optional` **yPositiveFace**: [`AxisBoxFaceConfig`](AxisBoxFaceConfig.md)

### faces.zNegativeFace?

> `optional` **zNegativeFace**: [`AxisBoxFaceConfig`](AxisBoxFaceConfig.md)

### faces.zPositiveFace?

> `optional` **zPositiveFace**: [`AxisBoxFaceConfig`](AxisBoxFaceConfig.md)

### position?

> `optional` **position**: [`AbsolutePosition`](AbsolutePosition.md) \| [`RelativePosition`](RelativePosition.md)

Position, either absolute or relative.

### size?

> `optional` **size**: `number`

Size in pixels of the axis tool.

## Defined in

[packages/tools/src/AxisView/types.ts:12](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/AxisView/types.ts#L12)
