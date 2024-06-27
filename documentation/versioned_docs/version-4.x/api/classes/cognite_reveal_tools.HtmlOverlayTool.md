---
id: "cognite_reveal_tools.HtmlOverlayTool"
title: "Class: HtmlOverlayTool"
sidebar_label: "HtmlOverlayTool"
custom_edit_url: null
---

[@cognite/reveal/tools](../modules/cognite_reveal_tools.md).HtmlOverlayTool

Manages HTMLoverlays for [Cognite3DViewer](cognite_reveal.Cognite3DViewer.md). Attaches HTML elements to a
3D position and updates its position/visibility as user moves the camera. This is
useful to create HTML overlays to highlight information about key positions in the 3D model.

Attached elements *must* have CSS style 'position: absolute'. It's also recommended
in most cases to have styles 'pointer-events: none' and 'touch-action: none' to avoid
interfering with 3D navigation. Consider also applying 'transform: translate(-50%, -50%)'
to anchor the center of the element rather than the top-left corner. In some cases the
`zIndex`-attribute is necessary for the element to appear on top of the viewer.

**`Example`**

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

## Hierarchy

- [`Cognite3DViewerToolBase`](cognite_reveal_tools.Cognite3DViewerToolBase.md)

  ↳ **`HtmlOverlayTool`**

## Constructors

### constructor

• **new HtmlOverlayTool**(`viewer`, `options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `viewer` | [`Cognite3DViewer`](cognite_reveal.Cognite3DViewer.md) |
| `options?` | [`HtmlOverlayToolOptions`](../modules/cognite_reveal_tools.md#htmloverlaytooloptions) |

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[constructor](cognite_reveal_tools.Cognite3DViewerToolBase.md#constructor)

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:171](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L171)

## Accessors

### elements

• `get` **elements**(): \{ `element`: `HTMLElement` ; `position3D`: `Vector3`  }[]

Returns all added HTML elements along with their 3D positions.

#### Returns

\{ `element`: `HTMLElement` ; `position3D`: `Vector3`  }[]

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:191](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L191)

## Methods

### add

▸ **add**(`htmlElement`, `position3D`, `options?`): `void`

Registers a HTML overlay that will be updated on rendering.

#### Parameters

| Name | Type |
| :------ | :------ |
| `htmlElement` | `HTMLElement` |
| `position3D` | `Vector3` |
| `options` | [`HtmlOverlayOptions`](../modules/cognite_reveal_tools.md#htmloverlayoptions) |

#### Returns

`void`

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:215](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L215)

___

### clear

▸ **clear**(): `void`

Removes all attached HTML overlay elements.

#### Returns

`void`

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:263](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L263)

___

### dispose

▸ **dispose**(): `void`

Removes all elements and detaches from the viewer.

#### Returns

`void`

#### Overrides

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[dispose](cognite_reveal_tools.Cognite3DViewerToolBase.md#dispose)

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:201](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L201)

___

### forceUpdate

▸ **forceUpdate**(`customCamera?`): `void`

Updates positions of all overlays. This is automatically managed and there
shouldn't be any reason to trigger this unless the attached elements are
modified externally.

Calling this function often might cause degraded performance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `customCamera?` | `PerspectiveCamera` | Optional camera to be used in place of viewerCamera when calculating positions |

#### Returns

`void`

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:298](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L298)

___

### off

▸ **off**(`event`, `handler`): `void`

Unregisters an event handler for the 'disposed'-event.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disposed"`` |
| `handler` | () => `void` |

#### Returns

`void`

#### Inherited from

[Cognite3DViewerToolBase](cognite_reveal_tools.Cognite3DViewerToolBase.md).[off](cognite_reveal_tools.Cognite3DViewerToolBase.md#off)

#### Defined in

[packages/tools/src/Cognite3DViewerToolBase.ts:38](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/Cognite3DViewerToolBase.ts#L38)

___

### remove

▸ **remove**(`htmlElement`): `void`

Removes a overlay and removes it from the DOM.

#### Parameters

| Name | Type |
| :------ | :------ |
| `htmlElement` | `HTMLElement` |

#### Returns

`void`

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:251](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L251)

___

### visible

▸ **visible**(`enable`): `void`

Hide/unhide all HTML overlay elements.

#### Parameters

| Name | Type |
| :------ | :------ |
| `enable` | `boolean` |

#### Returns

`void`

#### Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:275](https://github.com/cognitedata/reveal/blob/e9e26d38/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L275)
