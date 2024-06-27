# Class: NumericRange

## Constructors

### new NumericRange()

> **new NumericRange**(`from`, `count`): [`NumericRange`](NumericRange.md)

#### Parameters

• **from**: `number`

• **count**: `number`

#### Returns

[`NumericRange`](NumericRange.md)

#### Defined in

[packages/utilities/src/NumericRange.ts:10](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/NumericRange.ts#L10)

## Properties

### count

> `readonly` **count**: `number`

#### Defined in

[packages/utilities/src/NumericRange.ts:7](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/NumericRange.ts#L7)

***

### from

> `readonly` **from**: `number`

#### Defined in

[packages/utilities/src/NumericRange.ts:6](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/NumericRange.ts#L6)

***

### toInclusive

> `readonly` **toInclusive**: `number`

#### Defined in

[packages/utilities/src/NumericRange.ts:8](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/NumericRange.ts#L8)

## Methods

### contains()

> **contains**(`value`): `boolean`

#### Parameters

• **value**: `number`

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/NumericRange.ts:38](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/NumericRange.ts#L38)

***

### equal()

> **equal**(`other`): `boolean`

#### Parameters

• **other**: [`NumericRange`](NumericRange.md)

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/NumericRange.ts:34](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/NumericRange.ts#L34)

***

### forEach()

> **forEach**(`action`): `void`

#### Parameters

• **action**

#### Returns

`void`

#### Defined in

[packages/utilities/src/NumericRange.ts:72](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/NumericRange.ts#L72)

***

### intersectionWith()

> **intersectionWith**(`range`): `undefined` \| [`NumericRange`](NumericRange.md)

#### Parameters

• **range**: [`NumericRange`](NumericRange.md)

#### Returns

`undefined` \| [`NumericRange`](NumericRange.md)

#### Defined in

[packages/utilities/src/NumericRange.ts:50](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/NumericRange.ts#L50)

***

### intersects()

> **intersects**(`range`): `boolean`

#### Parameters

• **range**: [`NumericRange`](NumericRange.md)

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/NumericRange.ts:42](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/NumericRange.ts#L42)

***

### intersectsOrCoinciding()

> **intersectsOrCoinciding**(`range`): `boolean`

#### Parameters

• **range**: [`NumericRange`](NumericRange.md)

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/NumericRange.ts:46](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/NumericRange.ts#L46)

***

### isInside()

> **isInside**(`range`): `boolean`

#### Parameters

• **range**: [`NumericRange`](NumericRange.md)

#### Returns

`boolean`

#### Defined in

[packages/utilities/src/NumericRange.ts:61](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/NumericRange.ts#L61)

***

### toArray()

> **toArray**(): `number`[]

#### Returns

`number`[]

#### Defined in

[packages/utilities/src/NumericRange.ts:30](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/NumericRange.ts#L30)

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Defined in

[packages/utilities/src/NumericRange.ts:78](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/NumericRange.ts#L78)

***

### union()

> **union**(`range`): [`NumericRange`](NumericRange.md)

#### Parameters

• **range**: [`NumericRange`](NumericRange.md)

#### Returns

[`NumericRange`](NumericRange.md)

#### Defined in

[packages/utilities/src/NumericRange.ts:65](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/NumericRange.ts#L65)

***

### values()

> **values**(): `Generator`\<`number`, `any`, `unknown`\>

#### Returns

`Generator`\<`number`, `any`, `unknown`\>

#### Defined in

[packages/utilities/src/NumericRange.ts:24](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/NumericRange.ts#L24)

***

### createFromInterval()

> `static` **createFromInterval**(`from`, `toInclusive`): [`NumericRange`](NumericRange.md)

#### Parameters

• **from**: `number`

• **toInclusive**: `number`

#### Returns

[`NumericRange`](NumericRange.md)

#### Defined in

[packages/utilities/src/NumericRange.ts:20](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/NumericRange.ts#L20)

***

### isNumericRange()

> `static` **isNumericRange**(`value`): `value is NumericRange`

#### Parameters

• **value**: `any`

#### Returns

`value is NumericRange`

#### Defined in

[packages/utilities/src/NumericRange.ts:82](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/utilities/src/NumericRange.ts#L82)
