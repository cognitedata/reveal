# @cognite/ornate

A library used to layout P&IDs and other images, and add different shapes and functionality on top of them

## Getting started

```js
import { CogniteOrnate } from '@cognite/ornate';

ornateViewer = new CogniteOrnate({
  container: '#container',
});
```

`ornateViewer` will add and control canvas elements within that container. From there, you can use the functions inside of ornateViewer to enable your use case.

## Tools

To enable the exensibility of the application, you can use tools to control the current interaction method.
The library provides a list of predefined tools for use.

```js
import {
  MoveTool,
  LineTool,
  RectTool,
  TextTool,
  DefaultTool,
  CircleTool,
  ListTool,
} from '@cognite/ornate';

ornateViewer.tools = {
  move: new MoveTool(ornateViewer.current),
  line: new LineTool(ornateViewer.current),
  rect: new RectTool(ornateViewer.current),
  circle: new CircleTool(ornateViewer.current),
  text: new TextTool(ornateViewer.current),
  list: listTool,
  default: new DefaultTool(ornateViewer.current),
};

ornateViewer.currentTool = ornateViewer.current.tools.default;
```

## Examples

### Loading a PDF with annotations (via CDF)

Adding a document is done like so.

```js

const fileURL = await client.files.getDownloadUrls([{ id: fileId }]).then(res => res[0].downloadUrl);

const pdfDocument = await ornateViewer.current!.addPDFDocument(
  fileURL, // URL of file
  1, // Page
  { fileId: String(fileId), fileName }, // Metadata for document (useful for saving/loading state)
)

```

If you have annotations as events, you can add them like so

```js
// Get RAW annotation events
const rawAnnotationEvents = await client.events.list({
  filter: {
    type: 'cognite_annotation',
    metadata: {
      CDF_ANNOTATION_file_id: String(fileId),
    },
  },
});

// Map raw annotations to the `OrnateAnnotation`
const annotations = rawAnnotationEvents.items.map((event) => {
  const box = JSON.parse(event.metadata?.CDF_ANNOTATION_box || '');
  const type = event.metadata?.CDF_ANNOTATION_resource_type || 'unknown';

  const newAnnotation: OrnateAnnotation = {
    id: `${fileId}_${event.metadata?.CDF_ANNOTATION_resource_id}`,
    type: 'pct',
    x: box.xMin,
    y: box.yMin,
    width: box.xMax - box.xMin,
    height: box.yMax - box.yMin,
    fill: 'red',
    strokeWidth: 2,
    onClick: (data) => {},
    metadata: {
      type,
      resourceId: event.metadata?.CDF_ANNOTATION_resource_id || '',
    },
  };
  return newAnnotation;
});

// Then, add these annotations to the PDF
const instances = ornateViewer.addAnnotationsToGroup(
  pdfDocument, // Result of ornate.addPDFDocument function
  annotations
);
```

### Changing tools

You can change the active tool like so

```js
ornateViewer.handleToolChange('TOOL');
```

where TOOL is a valid tool type (currently, you can only use tools within the library. This can be fixed)

### Restart

You can reset everything by using

```js
ornateViewer.restart();
```

### Export

You can export all the active documents, with visible drawings, to a single PDF by using this method

```js
ornateViewer.onExport('file-name');
```

### Zoom to

You can zoom to a particular object by using the `zoomTo` method

```js
ornateViewer.zoomTo(instance);
```

Instance must be a Shape instance that exists in the viewer.

### Export to JSON

You can export all of the workspaces documents, drawings and markers to a JSON format by using:

```js
ornateViewer.exportToJSON();
```

You can then manually parse through this JSON string to reload everything you have done.

### Add custom drawings and shapes

You can add your own shapes programatically by using the `ornateViewer.addDrawings()` method. For example:

```js

const drawings: Drawing[] = [
  {
    type: 'rect',
    attrs: {
      x: 10,
      y: 10,
      ...
    },
    groupId: '...',
  }
]

ornateViewer.current!.addDrawings(drawings);

```

### Connecting documents

You can connect two documents together based on their document annotations using this function.
(This isn't very developer friendly right now, and will be improved)

```js
const data = event.detail as OrnateAnnotationInstance;
if (data.annotation?.metadata?.type === 'file') {
  const { resourceId } = data.annotation.metadata;

  const file = await client.files.retrieve([{ id: Number(resourceId) }]);

  const fileInfo = await loadFile(file[0].id.toString(), file[0].name);

  const { doc, instances = [] } = fileInfo;
  const docFileId = data.document?.metadata?.fileId;
  const endPointAnnotation = instances.find(
    (x) => x.annotation.metadata?.resourceId === docFileId
  );

  ornateViewer.connectDocuments(
    data.document,
    doc,
    { x: data.instance.x(), y: data.instance.y() },
    data.instance,
    endPointAnnotation?.instance
  );
}

```
