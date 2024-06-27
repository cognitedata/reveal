# Type Alias: SerializableNodeAppearance

> **SerializableNodeAppearance**: `object`

Type that represents a [NodeAppearance](NodeAppearance.md) in a serializable format

## Type declaration

### color?

> `readonly` `optional` **color**: [`number`, `number`, `number`]

Color as an RGB number tuple, with values in the range [0, 255]

### outlineColor?

> `readonly` `optional` **outlineColor**: [`NodeOutlineColor`](../enumerations/NodeOutlineColor.md)

Outline color,

#### See

[NodeAppearance](NodeAppearance.md)

### prioritizedForLoadingHint?

> `readonly` `optional` **prioritizedForLoadingHint**: `number`

Prioritized loading hint,

#### See

[NodeAppearance](NodeAppearance.md)

### renderGhosted?

> `readonly` `optional` **renderGhosted**: `boolean`

Whether to render ghosted,

#### See

[NodeAppearance](NodeAppearance.md)

### renderInFront?

> `readonly` `optional` **renderInFront**: `boolean`

Whether to render in front,

#### See

[NodeAppearance](NodeAppearance.md)

### visible?

> `readonly` `optional` **visible**: `boolean`

Visibility,

#### See

[NodeAppearance](NodeAppearance.md)

## Defined in

[packages/cad-styling/src/NodeAppearance.ts:77](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/NodeAppearance.ts#L77)
