`@cognite/reveal` supports `Node16` [module resolution](https://www.typescriptlang.org/tsconfig#moduleResolution), and if enabled in the consuming application will expose three modules:
- [@cognite/reveal](/api/@cognite/reveal/index.md) is the main module and has the main entry point of Reveal, [`Cognite3DViewer`](/api/@cognite/reveal/classes/Cognite3DViewer.md). CAD models are represented by [`CogniteCadModel`](/api/@cognite/reveal/classes/CogniteCadModel.md) and points clouds by [`CognitePointCloudModel`](/api/@cognite/reveal/classes/CognitePointCloudModel.md).
- [@congite/reveal/tools](/api/@cognite/reveal/tools/index.md) contains a set of tools, e.g. [`AxisViewTool`](/api/@cognite/reveal/tools/classes/AxisViewTool.md), [`TimelineTool`](/api/@cognite/reveal/tools/classes/TimelineTool.md), and [`HtmlOverlayTool`](/api/@cognite/reveal/tools/classes/HtmlOverlayTool.md) that works with `Cognite3DViewer`.
- [@cognite/reveal/extensions/datasource](/api/@cognite/reveal/extensions/datasource/index.md) allows providing custom data sources for geometry and model metadata.

:::note
If the consuming application does not enable `Node16` module resolution, then all types must be imported from `@cognite/reveal`.
:::
