`@cognite/reveal` supports `Node16` [module resolution](https://www.typescriptlang.org/tsconfig#moduleResolution), and if enabled in the consuming application will expose three modules:
- [@cognite/reveal](/api/modules/cognite_reveal.md) is the main module and has the main entry point of Reveal, [`Cognite3DViewer`](/api/classes/cognite_reveal.Cognite3DViewer.md). CAD models are represented by [`CogniteCadModel`](/api/classes/cognite_reveal.CogniteCadModel.md) and points clouds by [`CognitePointCloudModel`](/api/classes/cognite_reveal.CognitePointCloudModel.md).
- [@congite/reveal/tools](/api/modules/cognite_reveal_tools.md) contains a set of tools, e.g. [`AxisViewTool`](/api/classes/cognite_reveal_tools.AxisViewTool.md), [`TimelineTool`](/api/classes/cognite_reveal_tools.TimelineTool.md), and [`HtmlOverlayTool`](/api/classes/cognite_reveal_tools.HtmlOverlayTool.md) that works with `Cognite3DViewer`.
- [@cognite/reveal/extensions/datasource](/api/modules/cognite_reveal_extensions_datasource.md) allows providing custom data sources for geometry and model metadata.

:::note
If the consuming application does not enable `Node16` module resolution, then all types must be imported from `@cognite/reveal`.
:::