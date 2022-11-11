`@cognite/reveal` supports `Node16` [module resolution](https://www.typescriptlang.org/tsconfig#moduleResolution), and if enabled in the consuming application will expose three modules:
- [@cognite/reveal](modules/cognite_reveal) is the main module and has the main entry point of Reveal, [`Cognite3DViewer`](classes/cognite3dviewer). CAD models are represented by [`CogniteCadModel`](classes/cognitecadmodel) and points clouds by [`CognitePointCloudModel`](classes/cognitepointcloudmodel).
- [@congite/reveal/tools](modules/cognite_reveal_tools) contains a set of tools, e.g. [`AxisViewTool`](classes/cognite_reveal_tools.axisviewtool), [`TimelineTool`](classes/cognite_reveal_tools.timelinetool), and [`HtmlOverlayTool`](classes/cognite_reveal_tools.htmloverlaytool) that works with `Cognite3DViewer`.
- [@cognite/reveal/extensions/datasource](modules/cognite_reveal_extensions_datasource) allows providing custom data sources for geometry and model metadata.

:::note
If the consuming application does not enable `Node16` module resolution, then all types must be imported from `@cognite/reveal`.
:::