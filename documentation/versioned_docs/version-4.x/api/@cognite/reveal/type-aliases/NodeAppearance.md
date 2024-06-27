# Type Alias: NodeAppearance

> **NodeAppearance**: `object`

Type for defining node appearance profiles to style a 3D CAD model.

## See

[DefaultNodeAppearance](../variables/DefaultNodeAppearance.md)

## Type declaration

### color?

> `readonly` `optional` **color**: `Color`

Overrides the default color of the node in RGB. Black,
or `new Color(0, 0, 0)` means no override.

### outlineColor?

> `readonly` `optional` **outlineColor**: [`NodeOutlineColor`](../enumerations/NodeOutlineColor.md)

When set, an outline is drawn around the
node to make it stand out.

### prioritizedForLoadingHint?

> `readonly` `optional` **prioritizedForLoadingHint**: `number`

When provided, this value can be used to prioritize certain areas of the
3D model to be loaded. This can be useful to prioritize key objects in the
3D model to always be loaded.

When non-zero, sectors containing geometry in the vicinity of the prioritized
sectors are given an *extra* priority. Recommended values are in range 1 (somewhat
higher priority to be loaded) to 10 (very likely to be loaded). Usually values around 4-5
is recommended.

Prioritized nodes are loaded at the expense of non-prioritized areas. There are no
guarantees that the nodes are actually loaded, and the more prioritized areas/nodes
provided, the less likely it is that the hint is obeyed.

Extra priority doesn't accumulate when sectors are prioritized because they intersect/contain
several nodes.

**This is an advanced feature and not recommended for most users**

#### Version

Only works with 3D models converted later than Q4 2021.

### renderGhosted?

> `readonly` `optional` **renderGhosted**: `boolean`

When set to true, the node is rendered ghosted, i.e.
transparent with a fixed color. This has no effect if NodeAppearance.renderInFront
is `true`.

### renderInFront?

> `readonly` `optional` **renderInFront**: `boolean`

When set to true, the node is rendered in front
of all other nodes even if it's occluded.
Note that this take precedence over NodeAppearance.renderGhosted.

### visible?

> `readonly` `optional` **visible**: `boolean`

Overrides the visibility of the node.

## Defined in

[packages/cad-styling/src/NodeAppearance.ts:22](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/cad-styling/src/NodeAppearance.ts#L22)
