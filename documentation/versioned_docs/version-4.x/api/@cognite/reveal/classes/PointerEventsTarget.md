# Class: PointerEventsTarget

**`Beta`**

This class fires click, double click, hover end similar events at a PointerEvents
onClick will fired if it's a single click, and the mouse hasn't move too much
If onDoubleClick is fired, the onClick will not be fired
onHover will be fired only if the mouse button is not pressed and not to often
If mouse, the onDoubleClick and onClick is fired when the left mouse button is pressed
onPointerDrag will be fired wnen the mouse button is pressed and the mouse is moving

## Constructors

### new PointerEventsTarget()

> **new PointerEventsTarget**(`domElement`, `events`): [`PointerEventsTarget`](PointerEventsTarget.md)

**`Beta`**

#### Parameters

• **domElement**: `HTMLElement`

• **events**: [`PointerEvents`](PointerEvents.md)

#### Returns

[`PointerEventsTarget`](PointerEventsTarget.md)

#### Defined in

[packages/utilities/src/events/PointerEventsTarget.ts:49](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/utilities/src/events/PointerEventsTarget.ts#L49)

## Methods

### addEventListeners()

> **addEventListeners**(): `void`

**`Beta`**

#### Returns

`void`

#### Defined in

[packages/utilities/src/events/PointerEventsTarget.ts:58](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/utilities/src/events/PointerEventsTarget.ts#L58)

***

### removeEventListeners()

> **removeEventListeners**(): `void`

**`Beta`**

#### Returns

`void`

#### Defined in

[packages/utilities/src/events/PointerEventsTarget.ts:65](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/utilities/src/events/PointerEventsTarget.ts#L65)
