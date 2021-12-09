import { useEffect, useRef, useState } from 'react';
import {
  CogniteOrnate,
  // Types
  ToolType,
  // Tools
  MoveTool,
  LineTool,
  RectTool,
  TextTool,
  DefaultTool,
  CircleTool,
  CommentTool,
  OrnateTransformer,
} from '@cognite/ornate';
import { useMetrics } from '@cognite/metrics';
import { LineReview } from 'modules/lineReviews/types';
import { useAuthContext } from '@cognite/react-container';
import WorkSpaceTools from 'components/WorkSpaceTools';
import Konva from 'konva';

type LineReviewViewerProps = {
  lineReview: LineReview;
};

const LineReviewViewer = ({ lineReview }: LineReviewViewerProps) => {
  const metrics = useMetrics('LineReview');
  const ornateViewer = useRef<CogniteOrnate>();
  const [activeTool, setActiveTool] = useState<ToolType>('default');
  const { client } = useAuthContext();
  // Setup Ornate
  useEffect(() => {
    if (ornateViewer.current) {
      return;
    }
    ornateViewer.current = new CogniteOrnate({
      container: '#lineReview-viewer',
    });
    document.addEventListener('ornate_toolChange', ((
      e: CustomEvent<ToolType>
    ) => {
      setActiveTool(e.detail);
    }) as EventListener);
    loadTools();
  }, []);

  useEffect(() => {
    if (!ornateViewer.current) {
      return;
    }
    loadLineReview(lineReview);
  }, [lineReview]);

  const loadLineReview = (lineReview: LineReview) => {
    if (!client || !ornateViewer.current) {
      return;
    }
    ornateViewer.current?.restart();
    lineReview.documents.forEach(async (doc, i) => {
      const url = await client.files
        .getDownloadUrls([{ externalId: doc.fileExternalId }])
        .then((res) => res[0].downloadUrl);
      const ornateDoc = await ornateViewer.current!.addPDFDocument(
        url,
        1,
        {},
        { initialPosition: { x: i * 2500 + 150, y: 0 } }
      );

      ornateViewer.current!.addAnnotationsToGroup(
        ornateDoc,
        doc.annotations.map((a) => ({
          id: '',
          type: 'pct',
          width: a.max[0] - a.min[0],
          height: a.max[1] - a.min[1],
          x: a.min[0],
          y: a.min[1],
          stroke: 'red',
          strokeWidth: 16,
          fill: 'rgba(0, 0, 0, 0)',
          cornerRadius: 8,
          onClick: (x) => {
            console.log(a, x);
          },
        }))
      );
    });
  };

  const onToolChange = (tool: ToolType) => {
    metrics.track('toolChange', { tool });
    ornateViewer.current!.handleToolChange(tool);
    setActiveTool(tool);
  };

  const loadTools = () => {
    if (ornateViewer.current) {
      // NEXT:
      // - Figure this out
      // - Report back -> in review.
      setTimeout(() => {
        const ornateTransfomer = new OrnateTransformer();
        ornateViewer.current!.transformer = ornateTransfomer;
        ornateViewer.current!.baseLayer.add(ornateViewer.current!.transformer);
        ornateTransfomer.onSelectNodes = (nodes) => {
          console.log(nodes);
        };
      }, 2000);
      ornateViewer.current.tools = {
        move: new MoveTool(ornateViewer.current),
        line: new LineTool(ornateViewer.current),
        rect: new RectTool(ornateViewer.current),
        circle: new CircleTool(ornateViewer.current),
        text: new TextTool(ornateViewer.current),
        comment: new CommentTool(ornateViewer.current),
        default: new DefaultTool(ornateViewer.current),
      };
      onToolChange('default');
      ornateViewer.current.currentTool = ornateViewer.current.tools.default;
    }
  };

  return (
    <div
      style={{
        flexGrow: 1,
        position: 'relative',
        height: 'calc(100vh - 180px - 60px)',
      }}
    >
      <div id="lineReview-viewer" />

      <WorkSpaceTools
        onToolChange={onToolChange}
        onSetLayerVisibility={(layer, visible) => {
          const shapes: Konva.Node[] = [];
          if (layer === 'ANNOTATIONS') {
            // Get annotations. Then filter out the ones affected by the list tool
            shapes.push(
              ...(ornateViewer.current?.stage.find('.annotation') || []).filter(
                (shape) => !shape.attrs.inList
              )
            );
          }
          if (layer === 'DRAWINGS') {
            shapes.push(
              ...(ornateViewer.current?.stage.find('.drawing') || []).filter(
                (shape) => !shape.attrs.inList
              )
            );
          }
          if (layer === 'MARKERS') {
            shapes.push(...(ornateViewer.current?.stage.find('.marker') || []));
          }
          shapes.forEach((shape) => {
            if (visible) {
              shape.show();
            } else {
              shape.hide();
            }
          });
        }}
        activeTool={activeTool}
      />
    </div>
  );
};

export default LineReviewViewer;
