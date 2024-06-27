# Type Alias: MeasurementOptions

> **MeasurementOptions**: `object`

Measurement tool option with user custom callback, line width & color.

## Type declaration

### color?

> `optional` **color**: `Color`

Line color in 32 bit hex.

### distanceToLabelCallback?

> `optional` **distanceToLabelCallback**: [`DistanceToLabelDelegate`](DistanceToLabelDelegate.md)

### lineWidth?

> `optional` **lineWidth**: `number`

Line width in cm. Note that the minium drawn line will be ~2 pixels.

## Defined in

[packages/tools/src/Measurement/types.ts:37](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Measurement/types.ts#L37)
