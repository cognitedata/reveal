# Class: CustomObject

**`Beta`**

This class encasulate a Object3D, and made it possible to add flags to it.
It might be extended with more flags in the future.

## Implements

- [`ICustomObject`](../interfaces/ICustomObject.md)

## Constructors

### new CustomObject()

> **new CustomObject**(`object`): [`CustomObject`](CustomObject.md)

**`Beta`**

Constructor

#### Parameters

• **object**: `Object3D`\<`Object3DEventMap`\>

#### Returns

[`CustomObject`](CustomObject.md)

#### Defined in

[packages/utilities/src/customObject/CustomObject.ts:26](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/customObject/CustomObject.ts#L26)

## Accessors

### isPartOfBoundingBox

> `get` **isPartOfBoundingBox**(): `boolean`

**`Beta`**

Set or get whether it should be part of the combined bounding box or not.
Default is true.

> `set` **isPartOfBoundingBox**(`value`): `void`

**`Beta`**

#### Parameters

• **value**: `boolean`

#### Returns

`boolean`

#### Implementation of

[`ICustomObject`](../interfaces/ICustomObject.md) . [`isPartOfBoundingBox`](../interfaces/ICustomObject.md#ispartofboundingbox)

#### Defined in

[packages/utilities/src/customObject/CustomObject.ts:43](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/customObject/CustomObject.ts#L43)

***

### object

> `get` **object**(): `Object3D`\<`Object3DEventMap`\>

**`Beta`**

Get the Object3D

#### Returns

`Object3D`\<`Object3DEventMap`\>

#### Implementation of

[`ICustomObject`](../interfaces/ICustomObject.md) . [`object`](../interfaces/ICustomObject.md#object)

#### Defined in

[packages/utilities/src/customObject/CustomObject.ts:34](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/customObject/CustomObject.ts#L34)

***

### shouldPick

> `get` **shouldPick**(): `boolean`

**`Beta`**

Set or get whether it should be picked by the camera manager
Default is false.

> `set` **shouldPick**(`value`): `void`

**`Beta`**

#### Parameters

• **value**: `boolean`

#### Returns

`boolean`

#### Implementation of

[`ICustomObject`](../interfaces/ICustomObject.md) . [`shouldPick`](../interfaces/ICustomObject.md#shouldpick)

#### Defined in

[packages/utilities/src/customObject/CustomObject.ts:56](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/customObject/CustomObject.ts#L56)

***

### shouldPickBoundingBox

> `get` **shouldPickBoundingBox**(): `boolean`

**`Beta`**

Set or get whether it should be also give the bounding box when picked by the camera
Default is false.

> `set` **shouldPickBoundingBox**(`value`): `void`

**`Beta`**

#### Parameters

• **value**: `boolean`

#### Returns

`boolean`

#### Implementation of

[`ICustomObject`](../interfaces/ICustomObject.md) . [`shouldPickBoundingBox`](../interfaces/ICustomObject.md#shouldpickboundingbox)

#### Defined in

[packages/utilities/src/customObject/CustomObject.ts:69](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/customObject/CustomObject.ts#L69)

***

### useDepthTest

> `get` **useDepthTest**(): `boolean`

**`Beta`**

Get whether it should be rendered with depth test (on top on other objects)
Default is true.

> `set` **useDepthTest**(`value`): `void`

**`Beta`**

#### Parameters

• **value**: `boolean`

#### Returns

`boolean`

#### Implementation of

[`ICustomObject`](../interfaces/ICustomObject.md) . [`useDepthTest`](../interfaces/ICustomObject.md#usedepthtest)

#### Defined in

[packages/utilities/src/customObject/CustomObject.ts:82](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/customObject/CustomObject.ts#L82)

## Methods

### beforeRender()

> **beforeRender**(`_camera`): `void`

**`Beta`**

This method is called before rendering of the custom object

#### Parameters

• **\_camera**: `PerspectiveCamera`

#### Returns

`void`

#### Implementation of

[`ICustomObject`](../interfaces/ICustomObject.md) . [`beforeRender`](../interfaces/ICustomObject.md#beforerender)

#### Defined in

[packages/utilities/src/customObject/CustomObject.ts:139](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/customObject/CustomObject.ts#L139)

***

### getBoundingBox()

> **getBoundingBox**(`target`): `Box3`

**`Beta`**

Get the bounding box from the object

#### Parameters

• **target**: `Box3`

#### Returns

`Box3`

#### Implementation of

[`ICustomObject`](../interfaces/ICustomObject.md) . [`getBoundingBox`](../interfaces/ICustomObject.md#getboundingbox)

#### Defined in

[packages/utilities/src/customObject/CustomObject.ts:94](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/customObject/CustomObject.ts#L94)

***

### intersectIfCloser()

> **intersectIfCloser**(`intersectInput`, `closestDistance`): `undefined` \| [`CustomObjectIntersection`](../type-aliases/CustomObjectIntersection.md)

**`Beta`**

Intersect the object with the raycaster.
This function can be overridden to provide custom intersection logic.

#### Parameters

• **intersectInput**: [`CustomObjectIntersectInput`](CustomObjectIntersectInput.md)

• **closestDistance**: `undefined` \| `number`

#### Returns

`undefined` \| [`CustomObjectIntersection`](../type-aliases/CustomObjectIntersection.md)

#### Implementation of

[`ICustomObject`](../interfaces/ICustomObject.md) . [`intersectIfCloser`](../interfaces/ICustomObject.md#intersectifcloser)

#### Defined in

[packages/utilities/src/customObject/CustomObject.ts:104](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/customObject/CustomObject.ts#L104)
