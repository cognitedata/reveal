# Class: Keyframe

Timeline Key Frames contains parameters to access Nodes, Styles for the Timeline

## Constructors

### new Keyframe()

> **new Keyframe**(`model`, `date`): [`Keyframe`](Keyframe.md)

#### Parameters

• **model**: [`CogniteCadModel`](../../classes/CogniteCadModel.md)

• **date**: `Date`

#### Returns

[`Keyframe`](Keyframe.md)

#### Defined in

[packages/tools/src/Timeline/Keyframe.ts:17](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Timeline/Keyframe.ts#L17)

## Methods

### activate()

> **activate**(): `void`

Assigns the styles for the node set for the model for this Keyframe

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/Keyframe.ts:33](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Timeline/Keyframe.ts#L33)

***

### assignStyledNodeCollection()

> **assignStyledNodeCollection**(`nodeCollection`, `nodeAppearance`): `void`

Add node & style to the collection. If the collection has been added, the style is updated to the
appearance provided.

#### Parameters

• **nodeCollection**: [`NodeCollection`](../../classes/NodeCollection.md)

Node set to apply the Styles

• **nodeAppearance**: [`NodeAppearance`](../../type-aliases/NodeAppearance.md)

Style to assign to the node collection

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/Keyframe.ts:54](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Timeline/Keyframe.ts#L54)

***

### deactivate()

> **deactivate**(): `void`

Removes the style for the model

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/Keyframe.ts:42](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Timeline/Keyframe.ts#L42)

***

### getKeyframeDate()

> **getKeyframeDate**(): `Date`

Get date of the Keyframe

#### Returns

`Date`

date

#### Defined in

[packages/tools/src/Timeline/Keyframe.ts:26](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Timeline/Keyframe.ts#L26)

***

### unassignStyledNodeCollection()

> **unassignStyledNodeCollection**(`nodeCollection`): `void`

Remove Node & Style for this keyframe's nodeCollection and nodeAppearance

#### Parameters

• **nodeCollection**: [`NodeCollection`](../../classes/NodeCollection.md)

Nodes to be unassign from node collection

#### Returns

`void`

#### Defined in

[packages/tools/src/Timeline/Keyframe.ts:69](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/Timeline/Keyframe.ts#L69)
