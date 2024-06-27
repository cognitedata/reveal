# Type Alias: HtmlOverlayOptions

> **HtmlOverlayOptions**: `object`

Options for an overlay added using [HtmlOverlayTool.add](../classes/HtmlOverlayTool.md#add).

## Type declaration

### positionUpdatedCallback?

> `optional` **positionUpdatedCallback**: [`HtmlOverlayPositionUpdatedDelegate`](HtmlOverlayPositionUpdatedDelegate.md)

Callback that is triggered whenever the position of the overlay is updated. Optional.

### userData?

> `optional` **userData**: `any`

Optional user specified data that is provided to the [HtmlOverlayCreateClusterDelegate](HtmlOverlayCreateClusterDelegate.md) and
[HtmlOverlayPositionUpdatedDelegate](HtmlOverlayPositionUpdatedDelegate.md).

## Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:42](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L42)
