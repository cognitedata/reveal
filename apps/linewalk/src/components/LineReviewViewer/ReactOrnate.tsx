import Konva from 'konva';
import { useEffect, useRef, useState } from 'react';
import { CogniteOrnate, OrnateTransformer, Drawing } from '@cognite/ornate';
import { v4 as uuid } from 'uuid';
import isEqual from 'lodash/isEqual';

import useElementDescendantFocus from '../../utils/useElementDescendantFocus';

export type Group = {
  id: string;
  onClick: () => void;
  drawings: Drawing[];
};

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
  groups?: Group[];
  drawings?: Drawing[];
  onAnnotationClick?: (nodes: any) => void;
  onOrnateRef?: (ref: CogniteOrnate | undefined) => void;
  renderWorkspaceTools?: (
    ornateRef: CogniteOrnate | undefined,
    isFocused: boolean
  ) => JSX.Element;
};

export const SLIDE_WIDTH = 2500;
export const SHAMEFUL_SLIDE_HEIGHT = 1617;
export const SLIDE_COLUMN_GAP = 150;
export const SLIDE_ROW_GAP = 300;

const useSyncDrawings = (
  ornateRef: CogniteOrnate | undefined,
  drawings: Drawing[] | undefined,
  isInitialized: boolean
) => {
  const [committedDrawings, setCommittedDrawings] = useState<Drawing[]>([]);

  useEffect(() => {
    if (isInitialized && ornateRef) {
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
  }, [drawings, isInitialized]);
};

const useSyncGroups = (
  ornateRef: CogniteOrnate | undefined,
  groups: Group[] | undefined,
  isInitialized: boolean
) => {
  const [committedGroups, setCommittedGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (isInitialized && ornateRef) {
      if (isEqual(groups, committedGroups)) {
        return;
      }

      committedGroups.forEach((group) =>
        group.id ? ornateRef.removeShapeById(group.id) : undefined
      );

      groups?.forEach((group) => {
        const konvaGroup = new Konva.Group({
          id: group.id,
        });

        if (group.onClick) {
          konvaGroup.on('click', group.onClick);
        }

        ornateRef.baseLayer.add(konvaGroup);
        group.drawings.forEach((drawing) =>
          ornateRef.addDrawings({
            ...drawing,
            groupId: group.id,
          })
        );
      });
      setCommittedGroups(groups || []);
    }
  }, [groups, isInitialized]);
};

const ReactOrnate = ({
  documents,
  drawings,
  groups,
  onOrnateRef,
  renderWorkspaceTools,
}: ReactOrnateProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const componentContainerId = useRef(
    `react-ornate-instance-${uuid()}`
  ).current;
  const ornateViewer = useRef<CogniteOrnate>();
  const [isInitialized, setIsInitialized] = useState(false);
  const { isFocused } = useElementDescendantFocus(containerRef);

  useSyncDrawings(ornateViewer.current, drawings, isInitialized);
  useSyncGroups(ornateViewer.current, groups, isInitialized);

  // Setup Ornate
  useEffect(() => {
    if (ornateViewer.current) {
      return;
    }

    ornateViewer.current = new CogniteOrnate({
      container: `#${componentContainerId}`,
    });

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

    if (ornateViewer.current.tools.move) {
      ornateViewer.current.currentTool = ornateViewer.current.tools.move;
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
                  width: SLIDE_WIDTH,
                  height: SHAMEFUL_SLIDE_HEIGHT,
                  groupId: id,
                  shouldCenterOnDoubleClick: false,
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
                    stroke: 'transparent',
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
      ornateViewer.current?.zoomToGroup(ornateViewer.current?.baseLayer, {
        scaleFactor: 0.95,
      });
    }
  }, [isInitialized]);

  return (
    <div
      ref={containerRef}
      style={{
        flexGrow: 1,
        position: 'relative',
        height: '100%',
        width: '100%',
      }}
    >
      <div id={componentContainerId} />

      {renderWorkspaceTools?.(ornateViewer.current, isFocused)}
    </div>
  );
};

export default ReactOrnate;
