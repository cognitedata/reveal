# Class: PointerEvents

**`Beta`**

This base should be extended for listen to various pointer events.

## Constructors

### new PointerEvents()

> **new PointerEvents**(): [`PointerEvents`](PointerEvents.md)

**`Beta`**

#### Returns

[`PointerEvents`](PointerEvents.md)

## Accessors

### isEnabled

> `get` **isEnabled**(): `boolean`

**`Beta`**

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/events/PointerEvents.ts:31](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/events/PointerEvents.ts#L31)

## Methods

### onClick()

> **onClick**(`_event`): `Promise`\<`void`\>

**`Beta`**

#### Parameters

• **\_event**: `PointerEvent`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/utilities/src/events/PointerEvents.ts:12](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/events/PointerEvents.ts#L12)

***

### onDoubleClick()

> **onDoubleClick**(`_event`): `Promise`\<`void`\>

**`Beta`**

#### Parameters

• **\_event**: `PointerEvent`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/utilities/src/events/PointerEvents.ts:16](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/events/PointerEvents.ts#L16)

***

### onHover()

> **onHover**(`_event`): `void`

**`Beta`**

#### Parameters

• **\_event**: `PointerEvent`

#### Returns

`void`

#### Defined in

[packages/utilities/src/events/PointerEvents.ts:10](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/events/PointerEvents.ts#L10)

***

### onPointerDown()

> **onPointerDown**(`_event`, `_leftButton`): `Promise`\<`void`\>

**`Beta`**

#### Parameters

• **\_event**: `PointerEvent`

• **\_leftButton**: `boolean`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/utilities/src/events/PointerEvents.ts:20](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/events/PointerEvents.ts#L20)

***

### onPointerDrag()

> **onPointerDrag**(`_event`, `_leftButton`): `Promise`\<`void`\>

**`Beta`**

#### Parameters

• **\_event**: `PointerEvent`

• **\_leftButton**: `boolean`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/utilities/src/events/PointerEvents.ts:27](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/events/PointerEvents.ts#L27)

***

### onPointerUp()

> **onPointerUp**(`_event`, `_leftButton`): `Promise`\<`void`\>

**`Beta`**

#### Parameters

• **\_event**: `PointerEvent`

• **\_leftButton**: `boolean`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/utilities/src/events/PointerEvents.ts:23](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/events/PointerEvents.ts#L23)
