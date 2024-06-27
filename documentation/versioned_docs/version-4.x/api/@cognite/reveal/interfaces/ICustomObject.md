# Interface: ICustomObject

**`Beta`**

This interface encasulate a Object3D, and made it possible to add flags to it.
It might be extended with more flags in the future.

## Accessors

### isPartOfBoundingBox

> `get` **isPartOfBoundingBox**(): `boolean`

**`Beta`**

Get whether it should be part of the combined bounding box or not.
Default is true.

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/customObject/ICustomObject.ts:26](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/customObject/ICustomObject.ts#L26)

***

### object

> `get` **object**(): `Object3D`\<`Object3DEventMap`\>

**`Beta`**

Get the Object3D

#### Returns

`Object3D`\<`Object3DEventMap`\>

#### Defined in

[packages/utilities/src/customObject/ICustomObject.ts:19](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/customObject/ICustomObject.ts#L19)

***

### shouldPick

> `get` **shouldPick**(): `boolean`

**`Beta`**

Get whether it should be picked by the camera manager
Default is false.

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/customObject/ICustomObject.ts:33](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/customObject/ICustomObject.ts#L33)

***

### shouldPickBoundingBox

> `get` **shouldPickBoundingBox**(): `boolean`

**`Beta`**

Set or get whether it should be also give the bounding box when picked by the camera
Default is false.

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/customObject/ICustomObject.ts:40](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/customObject/ICustomObject.ts#L40)

***

### useDepthTest

> `get` **useDepthTest**(): `boolean`

**`Beta`**

Get whether it should be rendered with depth test (on top on other objects)
Default is true.

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/customObject/ICustomObject.ts:47](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/customObject/ICustomObject.ts#L47)

## Methods

### beforeRender()

> **beforeRender**(`camera`): `void`

**`Beta`**

This method is called before rendering of the custom object

#### Parameters

• **camera**: `PerspectiveCamera`

#### Returns

`void`

#### Defined in

[packages/utilities/src/customObject/ICustomObject.ts:69](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/customObject/ICustomObject.ts#L69)

***

### getBoundingBox()

> **getBoundingBox**(`target`): `Box3`

**`Beta`**

Get the bounding box from the object

#### Parameters

• **target**: `Box3`

#### Returns

`Box3`

#### Defined in

[packages/utilities/src/customObject/ICustomObject.ts:53](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/customObject/ICustomObject.ts#L53)

***

### intersectIfCloser()

> **intersectIfCloser**(`intersectInput`, `closestDistance`): `undefined` \| [`CustomObjectIntersection`](../type-aliases/CustomObjectIntersection.md)

**`Beta`**

Intersect the object with the raycaster.
This function can be overridden to provide custom intersection logic.

#### Parameters

• **intersectInput**: [`CustomObjectIntersectInput`](../classes/CustomObjectIntersectInput.md)

• **closestDistance**: `undefined` \| `number`

#### Returns

`undefined` \| [`CustomObjectIntersection`](../type-aliases/CustomObjectIntersection.md)

#### Defined in

[packages/utilities/src/customObject/ICustomObject.ts:60](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/customObject/ICustomObject.ts#L60)
