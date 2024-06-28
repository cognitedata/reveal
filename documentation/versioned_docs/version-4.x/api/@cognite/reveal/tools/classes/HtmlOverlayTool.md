# Class: HtmlOverlayTool

Manages HTMLoverlays for [Cognite3DViewer](../../classes/Cognite3DViewer.md). Attaches HTML elements to a
3D position and updates its position/visibility as user moves the camera. This is
useful to create HTML overlays to highlight information about key positions in the 3D model.

Attached elements *must* have CSS style 'position: absolute'. It's also recommended
in most cases to have styles 'pointer-events: none' and 'touch-action: none' to avoid
interfering with 3D navigation. Consider also applying 'transform: translate(-50%, -50%)'
to anchor the center of the element rather than the top-left corner. In some cases the
`zIndex`-attribute is necessary for the element to appear on top of the viewer.

## Example

```js
const el = document.createElement('div');
el.style.position = 'absolute'; // Required!
// Anchor to center of element
el.style.transform = 'translate(-50%, -50%)';
// Avoid being target for events
el.style.pointerEvents = 'none;
el.style.touchAction = 'none';
// Render in front of other elements
el.style.zIndex = 10;

el.style.color = 'red';
el.innerHtml = '<h1>Overlay</h1>';

const overlayTool = new HtmlOverlayTool(viewer);
overlayTool.add(el, new THREE.Vector3(10, 10, 10));
// ...
overlayTool.remove(el);
// or, to remove all attached elements
overlayTool.clear();

// detach the tool from the viewer
overlayTool.dispose();
```

## Extends

- [`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md)

## Constructors

### new HtmlOverlayTool()

> **new HtmlOverlayTool**(`viewer`, `options`?): [`HtmlOverlayTool`](HtmlOverlayTool.md)

#### Parameters

• **viewer**: [`Cognite3DViewer`](../../classes/Cognite3DViewer.md)

• **options?**: [`HtmlOverlayToolOptions`](../type-aliases/HtmlOverlayToolOptions.md)

#### Returns

[`HtmlOverlayTool`](HtmlOverlayTool.md)

#### Overrides

[`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md) . [`constructor`](Cognite3DViewerToolBase.md#constructors)

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:172](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L172)

## Accessors

### elements

> `get` **elements**(): `object`[]

Returns all added HTML elements along with their 3D positions.

#### Returns

`object`[]

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:192](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L192)

## Methods

### add()

> **add**(`htmlElement`, `position3D`, `options`): `void`

Registers a HTML overlay that will be updated on rendering.

#### Parameters

• **htmlElement**: `HTMLElement`

• **position3D**: `Vector3`

• **options**: [`HtmlOverlayOptions`](../type-aliases/HtmlOverlayOptions.md) = `{}`

#### Returns

`void`

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:216](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L216)

***

### clear()

> **clear**(): `void`

Removes all attached HTML overlay elements.

#### Returns

`void`

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:266](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L266)

***

### dispose()

> **dispose**(): `void`

**`Override`**

Removes all elements and detaches from the viewer.

#### Returns

`void`

#### Overrides

[`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md) . [`dispose`](Cognite3DViewerToolBase.md#dispose)

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:202](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L202)

***

### forceUpdate()

> **forceUpdate**(`customCamera`?): `void`

Updates positions of all overlays. This is automatically managed and there
shouldn't be any reason to trigger this unless the attached elements are
modified externally.

Calling this function often might cause degraded performance.

#### Parameters

• **customCamera?**: `PerspectiveCamera`

Optional camera to be used in place of viewerCamera when calculating positions

#### Returns

`void`

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:301](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L301)

***

### off()

> **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

#### Parameters

• **event**: `"disposed"`

• **handler**

#### Returns

`void`

#### Inherited from

[`Cognite3DViewerToolBase`](Cognite3DViewerToolBase.md) . [`off`](Cognite3DViewerToolBase.md#off)

#### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:38](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L38)

***

### remove()

> **remove**(`htmlElement`): `void`

Removes a overlay and removes it from the DOM.

#### Parameters

• **htmlElement**: `HTMLElement`

#### Returns

`void`

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:254](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L254)

***

### visible()

> **visible**(`enable`): `void`

Hide/unhide all HTML overlay elements.

#### Parameters

• **enable**: `boolean`

#### Returns

`void`

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:278](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L278)
