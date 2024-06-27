# Type Alias: HtmlOverlayToolClusteringOptions

> **HtmlOverlayToolClusteringOptions**: `object`

Controls how close overlay elements are clustered together.

## Type declaration

### createClusterElementCallback

> **createClusterElementCallback**: [`HtmlOverlayCreateClusterDelegate`](HtmlOverlayCreateClusterDelegate.md)

Callback that is triggered when a set of overlays are clustered together
to create a "composite" element as a placeholder for the clustered elements.
Note that this callback will be triggered every frame for each cluster so it
must be performant.

### mode

> **mode**: `"overlapInScreenSpace"`

Currently only 'overlapInScreenSpace' is supported. In this mode,
overlays are clustered together into a single element as defined by
the HtmlOverlayToolClusteringOptions.createClusterElementCallback and hidden when they overlap
in screen space. The composite element is placed at the midpoint of
all clustered elements.

Clustered elements are faded in/out using CSS styling `transition`,
`opacity` and `visibility`.

## Defined in

[packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts:57](https://github.com/cognitedata/reveal/blob/2acd9d17229d2bc8e309653b4d6a39ad941e44f1/viewer/packages/tools/src/HtmlOverlay/HtmlOverlayTool.ts#L57)
