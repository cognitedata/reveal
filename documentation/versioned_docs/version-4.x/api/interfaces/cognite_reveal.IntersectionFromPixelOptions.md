---
id: "cognite_reveal.IntersectionFromPixelOptions"
title: "Interface: IntersectionFromPixelOptions"
sidebar_label: "IntersectionFromPixelOptions"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).IntersectionFromPixelOptions

Options to control how [getIntersectionFromPixel](../classes/cognite_reveal.Cognite3DViewer.md#getintersectionfrompixel) behaves.

**`Deprecated`**

Since 3.1 these options have no effect.

## Properties

### pointIntersectionThreshold

• `Optional` **pointIntersectionThreshold**: `number`

Threshold (in meters) for how close a point must be an intersection
ray for it to be considered an intersection for point clouds. Defaults
to 0.05.

**`Deprecated`**

Since 3.1, threshold doesn't affect picking because of new, GPU based method.

#### Defined in

[packages/api/src/public/migration/types.ts:226](https://github.com/cognitedata/reveal/blob/8cfa4004b/viewer/packages/api/src/public/migration/types.ts#L226)
