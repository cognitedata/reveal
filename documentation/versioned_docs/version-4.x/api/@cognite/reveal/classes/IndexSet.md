# Class: IndexSet

## Constructors

### new IndexSet()

> **new IndexSet**(`values`?): [`IndexSet`](IndexSet.md)

#### Parameters

• **values?**: `Iterable`\<`number`\>

#### Returns

[`IndexSet`](IndexSet.md)

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:13](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L13)

### new IndexSet()

> **new IndexSet**(`values`?): [`IndexSet`](IndexSet.md)

#### Parameters

• **values?**: [`NumericRange`](NumericRange.md)

#### Returns

[`IndexSet`](IndexSet.md)

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:14](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L14)

## Accessors

### count

> `get` **count**(): `number`

#### Returns

`number`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:68](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L68)

## Methods

### add()

> **add**(`index`): `void`

#### Parameters

• **index**: `number`

#### Returns

`void`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:33](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L33)

***

### addRange()

> **addRange**(`range`): `void`

#### Parameters

• **range**: [`NumericRange`](NumericRange.md)

#### Returns

`void`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:39](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L39)

***

### clear()

> **clear**(): `void`

#### Returns

`void`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:217](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L217)

***

### clone()

> **clone**(): [`IndexSet`](IndexSet.md)

#### Returns

[`IndexSet`](IndexSet.md)

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:221](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L221)

***

### contains()

> **contains**(`index`): `boolean`

#### Parameters

• **index**: `number`

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:60](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L60)

***

### differenceWith()

> **differenceWith**(`otherSet`): [`IndexSet`](IndexSet.md)

#### Parameters

• **otherSet**: [`IndexSet`](IndexSet.md)

#### Returns

[`IndexSet`](IndexSet.md)

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:135](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L135)

***

### forEachRange()

> **forEachRange**(`visitor`): `void`

#### Parameters

• **visitor**

#### Returns

`void`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:27](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L27)

***

### hasIntersectionWith()

> **hasIntersectionWith**(`otherSet`): `boolean`

#### Parameters

• **otherSet**: [`IndexSet`](IndexSet.md) \| `Set`\<`number`\>

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:145](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L145)

***

### hasIntersectionWithMap()

> **hasIntersectionWithMap**(`otherMap`): `boolean`

#### Parameters

• **otherMap**: `Map`\<`number`, `number`\>

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:163](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L163)

***

### intersectWith()

> **intersectWith**(`otherSet`): [`IndexSet`](IndexSet.md)

#### Parameters

• **otherSet**: [`IndexSet`](IndexSet.md)

#### Returns

[`IndexSet`](IndexSet.md)

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:177](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L177)

***

### invertedRanges()

> **invertedRanges**(): [`NumericRange`](NumericRange.md)[]

#### Returns

[`NumericRange`](NumericRange.md)[]

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:105](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L105)

***

### remove()

> **remove**(`index`): `void`

#### Parameters

• **index**: `number`

#### Returns

`void`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:47](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L47)

***

### removeRange()

> **removeRange**(`range`): `void`

#### Parameters

• **range**: [`NumericRange`](NumericRange.md)

#### Returns

`void`

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:52](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L52)

***

### toIndexArray()

> **toIndexArray**(): `number`[]

#### Returns

`number`[]

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:84](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L84)

***

### toPlainSet()

> **toPlainSet**(): `Set`\<`number`\>

#### Returns

`Set`\<`number`\>

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:98](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L98)

***

### toRangeArray()

> **toRangeArray**(): [`NumericRange`](NumericRange.md)[]

#### Returns

[`NumericRange`](NumericRange.md)[]

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:76](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L76)

***

### unionWith()

> **unionWith**(`otherSet`): [`IndexSet`](IndexSet.md)

#### Parameters

• **otherSet**: [`IndexSet`](IndexSet.md)

#### Returns

[`IndexSet`](IndexSet.md)

#### Defined in

[packages/utilities/src/indexset/IndexSet.ts:123](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/indexset/IndexSet.ts#L123)
