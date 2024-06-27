# Interface: Overlay3D\<ContentType\>

Represents one 3d overlay

## Type Parameters

• **ContentType**

## Methods

### getColor()

> **getColor**(): `Color`

Get the display color of this overlay.

#### Returns

`Color`

#### Defined in

[packages/3d-overlays/src/Overlay3D.ts:30](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/Overlay3D.ts#L30)

***

### getContent()

> **getContent**(): `ContentType`

Get the metadata associated with this overlay.

#### Returns

`ContentType`

#### Defined in

[packages/3d-overlays/src/Overlay3D.ts:34](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/Overlay3D.ts#L34)

***

### getPosition()

> **getPosition**(): `Vector3`

Get the position of this overlay.

#### Returns

`Vector3`

#### Defined in

[packages/3d-overlays/src/Overlay3D.ts:22](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/Overlay3D.ts#L22)

***

### getVisible()

> **getVisible**(): `boolean`

Get whether this overlay is visible.

#### Returns

`boolean`

#### Defined in

[packages/3d-overlays/src/Overlay3D.ts:18](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/Overlay3D.ts#L18)

***

### setColor()

> **setColor**(`color`): `void`

Set the display color of this overlay.

#### Parameters

• **color**: `Color`

#### Returns

`void`

#### Defined in

[packages/3d-overlays/src/Overlay3D.ts:26](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/Overlay3D.ts#L26)

***

### setVisible()

> **setVisible**(`visible`): `void`

Set whether this overlay should be visible.

#### Parameters

• **visible**: `boolean`

#### Returns

`void`

#### Defined in

[packages/3d-overlays/src/Overlay3D.ts:14](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/3d-overlays/src/Overlay3D.ts#L14)
