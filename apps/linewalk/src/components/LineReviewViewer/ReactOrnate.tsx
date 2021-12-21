import { useEffect, useRef, useState } from 'react';
import {
  CogniteOrnate,
  ToolType,
  OrnateTransformer,
  Drawing,
} from '@cognite/ornate';
import WorkSpaceTools from 'components/WorkSpaceTools';
import { v4 as uuid } from 'uuid';
import isEqual from 'lodash/isEqual';
import { DocumentConnection } from 'modules/lineReviews/types';
import { useDrawConnections } from 'hooks/useDrawConnections';

import { WorkspaceTool } from '../WorkSpaceTools/WorkSpaceTools';

export type ReactOrnateProps = {
  documents: {
    id: string;
    url: string;
    pageNumber: number;
    annotations: {
      id: string;
      markup: {
        type: 'line' | 'rect';
        min: [number, number];
        max: [number, number];
      }[];
    }[];
    row?: number;
    column?: number;
  }[];
  drawings?: Drawing[];
  connections?: DocumentConnection[];
  onAnnotationClick?: (nodes: any) => void;
  onOrnateRef?: (ref: CogniteOrnate | undefined) => void;
  tools?: WorkspaceTool[];
};

const SLIDE_WIDTH = 2500;
const SHAMEFUL_SLIDE_HEIGHT = 1625;
const SLIDE_COLUMN_GAP = 150;
const SLIDE_ROW_GAP = 300;

const ReactOrnate = ({
  documents,
  drawings,
  connections,
  tools,
  onOrnateRef,
}: ReactOrnateProps) => {
  const componentContainerId = useRef(
    `react-ornate-instance-${uuid()}`
  ).current;
  const ornateViewer = useRef<CogniteOrnate>();
  const [activeTool, setActiveTool] = useState<ToolType>('default');
  const [isInitialized, setIsInitialized] = useState(false);
  const [committedDrawings, setCommittedDrawings] = useState<Drawing[]>([]);

  useDrawConnections({
    ornateViewer: ornateViewer.current,
    connections,
    rowGap: Math.min(SLIDE_COLUMN_GAP, SLIDE_ROW_GAP),
    columnGap: SLIDE_COLUMN_GAP,
  });

  // Setup Ornate
  useEffect(() => {
    if (ornateViewer.current) {
      return;
    }

    ornateViewer.current = new CogniteOrnate({
      container: `#${componentContainerId}`,
    });
    document.addEventListener('ornate_toolChange', ((
      e: CustomEvent<ToolType>
    ) => {
      setActiveTool(e.detail);
    }) as EventListener);

    // NEXT:
    // - Figure this out
    // - Report back -> in review.
    setTimeout(() => {
      const ornateTransformer = new OrnateTransformer();
      ornateViewer.current!.transformer = ornateTransformer;
      ornateViewer.current!.baseLayer.add(ornateViewer.current!.transformer);
      // ornateTransformer.onSelectNodes = (nodes) => {
      //   onAnnotationClick(nodes);
      // };
    }, 2000);

    if (ornateViewer.current.tools.default) {
      ornateViewer.current.currentTool = ornateViewer.current.tools.default;
    }
  }, []);

  useEffect(() => {
    (async () => {
      const ornateRef = ornateViewer.current;

      if (ornateRef && documents?.length) {
        await Promise.all(
          documents.map(
            async ({
              id,
              url,
              pageNumber,
              annotations,
              row = 1,
              column = 1,
            }) => {
              // Do not add the same document twice
              if (
                ornateRef.documents.some((doc) => doc.group.attrs.id === id)
              ) {
                return;
              }

              console.log('Adding doc', url);
              const ornateDoc = await ornateRef?.addPDFDocument(
                url,
                pageNumber,
                {},
                {
                  zoomAfterLoad: false,
                  initialPosition: {
                    // Use column and row to determine positioning
                    x: (column - 1) * (SLIDE_WIDTH + SLIDE_COLUMN_GAP),
                    y: (row - 1) * (SHAMEFUL_SLIDE_HEIGHT + SLIDE_ROW_GAP),
                  },
                  groupId: id,
                }
              );

              ornateRef!.addAnnotationsToGroup(
                ornateDoc,
                annotations.flatMap((annotation) =>
                  annotation.markup.map((m) => ({
                    id: annotation.id,
                    type: 'pct',
                    width: m.max[0] - m.min[0],
                    height: m.max[1] - m.min[1],
                    x: m.min[0],
                    y: m.min[1],
                    stroke: 'red',
                    strokeWidth: 2,
                    fill: 'rgba(0, 0, 0, 0)',
                    cornerRadius: 8,
                    // onClick: (x) => {
                    //   console.log(annotation, x);
                    // },
                  }))
                )
              );
            }
          )
        );

        setIsInitialized(true);
      }
    })();
  }, [documents]);

  useEffect(() => {
    if (isInitialized) {
      onOrnateRef?.(ornateViewer.current);
      ornateViewer.current?.zoomToLocation(
        {
          x: 100,
          y: 100,
        },
        0.22
      );
    }
  }, [isInitialized]);

  const onToolChange = (tool: ToolType) => {
    ornateViewer.current?.handleToolChange(tool);
    setActiveTool(tool);
  };

  useEffect(() => {
    const handleInterval = setInterval(() => {
      console.log(ornateViewer.current?.exportToJSON());
    }, 5000);

    return () => {
      clearInterval(handleInterval);
    };
  }, []);

  useEffect(() => {
    const ornateRef = ornateViewer.current!;

    if (isInitialized) {
      if (isEqual(drawings, committedDrawings)) {
        return;
      }

      // Stupid version:
      // If a drawing has changed, remove all old drawings and add everything again
      committedDrawings.forEach((drawing) =>
        drawing.id ? ornateRef.removeShapeById(drawing.id) : undefined
      );

      drawings?.forEach((drawing) => ornateRef.addDrawings(drawing));
      setCommittedDrawings(drawings || []);
    }
  }, [drawings, connections, isInitialized]);

  return (
    <div
      style={{
        flexGrow: 1,
        position: 'relative',
        height: '100%',
        width: '100%',
      }}
    >
      <div id={componentContainerId} />

      <WorkSpaceTools
        enabledTools={tools}
        onToolChange={onToolChange}
        ornateRef={ornateViewer.current}
        activeTool={activeTool}
      />
    </div>
  );
};

export default ReactOrnate;
