# Variable: DefaultNodeAppearance

> `const` **DefaultNodeAppearance**: `object`

A set of default node appearances used in Reveal.

## Type declaration

### Default

> **Default**: [`NodeAppearance`](../type-aliases/NodeAppearance.md) = `DefaultAppearance`

### Ghosted

> **Ghosted**: [`NodeAppearance`](../type-aliases/NodeAppearance.md) = `GhostedAppearance`

### Hidden

> **Hidden**: [`NodeAppearance`](../type-aliases/NodeAppearance.md) = `HiddenAppearance`

### Highlighted

> **Highlighted**: `object`

### Highlighted.color?

> `readonly` `optional` **color**: `Color`

Overrides the default color of the node in RGB. Black,
or `new Color(0, 0, 0)` means no override.

### Highlighted.outlineColor?

> `readonly` `optional` **outlineColor**: [`NodeOutlineColor`](../enumerations/NodeOutlineColor.md)

When set, an outline is drawn around the
node to make it stand out.

### Highlighted.prioritizedForLoadingHint?

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

### Highlighted.renderGhosted?

> `readonly` `optional` **renderGhosted**: `boolean`

When set to true, the node is rendered ghosted, i.e.
transparent with a fixed color. This has no effect if NodeAppearance.renderInFront
is `true`.

### Highlighted.renderInFront?

> `readonly` `optional` **renderInFront**: `boolean`

When set to true, the node is rendered in front
of all other nodes even if it's occluded.
Note that this take precedence over NodeAppearance.renderGhosted.

### Highlighted.visible?

> `readonly` `optional` **visible**: `boolean`

Overrides the visibility of the node.

### InFront

> **InFront**: [`NodeAppearance`](../type-aliases/NodeAppearance.md) = `InFrontAppearance`

### Outlined

> **Outlined**: [`NodeAppearance`](../type-aliases/NodeAppearance.md) = `OutlinedAppearance`

## Defined in

[packages/cad-styling/src/NodeAppearance.ts:142](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/cad-styling/src/NodeAppearance.ts#L142)
