import Konva from 'konva';
import { PDFDocumentProxy } from 'pdfjs-dist/types/display/api';
import { useEffect, useRef, useState } from 'react';
import { CogniteOrnate, OrnateTransformer, Drawing } from '@cognite/ornate';
import { v4 as uuid } from 'uuid';
import isEqual from 'lodash/isEqual';

import usePrevious from '../../hooks/usePrevious';
import useElementDescendantFocus from '../../utils/useElementDescendantFocus';

import getKonvaSelectorSlugByExternalId from './getKonvaSelectorSlugByExternalId';

const getGroupById = (id: string, stage: Konva.Stage) => {
  return stage.findOne<Konva.Group>(`#${id}`);
};

export type Group = {
  id: string;
  groupId?: string;
  type: 'group';
  drawings: Drawing[];
  onClick?: () => void;
  cached?: boolean;
};

export type ReactOrnateProps = {
  documents: {
    id: string;
    pageNumber: number;
    row?: number;
    column?: number;
    type: string;
    name: string;
    pdfExternalId: string;
    pdf: PDFDocumentProxy;
  }[];
  nodes?: (Group | Drawing)[];
  onAnnotationClick?: (nodes: any) => void;
  onOrnateRef?: (ref: CogniteOrnate | undefined) => void;
  renderWorkspaceTools?: (
    ornateRef: CogniteOrnate | undefined,
    isFocused: boolean
  ) => JSX.Element;
  onRemovePress?: (pdfExternalId: string) => void;
};

export const SLIDE_WIDTH = 2500;
export const SHAMEFUL_SLIDE_HEIGHT = 1617;
export const SLIDE_COLUMN_GAP = 150;
export const SLIDE_ROW_GAP = 300;

const useSyncNodes = (
  ornateRef: CogniteOrnate | undefined,
  nodes: (Drawing | Group)[] | undefined,
  isInitialized: boolean
) => {
  const [committedNodes, setCommittedNodes] = useState<(Group | Drawing)[]>([]);

  useEffect(() => {
    if (isInitialized && ornateRef) {
      if (isEqual(nodes, committedNodes)) {
        return;
      }

      committedNodes.forEach((committedNode) =>
        committedNode.id
          ? ornateRef.removeShapeById(committedNode.id)
          : undefined
      );

      nodes
        ?.filter(
          (node) =>
            node.groupId === undefined ||
            getGroupById(node.groupId, ornateRef.stage) !== undefined
        )
        .forEach((node) => {
          if (node.type === 'group') {
            // Note: This is a bit icky for now as for groups we are handling
            // the adding in ReactOrnate, but for the remainder of the drawings
            // we are delegating the responsibility to Ornate. This is a smell
            // but it's better to keep it in ReactOrnate than to do something
            // premature about the APIs of Ornate.
            const konvaGroup = new Konva.Group({
              id: node.id,
            });

            const parent = node.groupId
              ? getGroupById(node.groupId, ornateRef.stage)
              : ornateRef.baseLayer;

            if (parent === undefined) {
              console.warn('No parent with id', node.groupId, ', skipping');
              return;
            }

            parent.add(konvaGroup);

            if (node.onClick) {
              konvaGroup.on('click', node.onClick);
            }

            node.drawings.forEach((drawing) =>
              ornateRef.addDrawings({
                ...drawing,
                groupId: node.id,
              })
            );

            if (node.cached) {
              konvaGroup.cache();
            }

            return;
          }

          ornateRef.addDrawings(node);
        });
      setCommittedNodes(nodes || []);
    }
  }, [nodes, isInitialized]);
};

const ReactOrnate = ({
  documents,
  nodes,
  onOrnateRef,
  renderWorkspaceTools,
  onRemovePress,
}: ReactOrnateProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const componentContainerId = useRef(
    `react-ornate-instance-${uuid()}`
  ).current;
  const ornateViewer = useRef<CogniteOrnate>();
  const [isInitialized, setIsInitialized] = useState(false);
  const { isFocused } = useElementDescendantFocus(containerRef);
  const addedPdfExternalIds = useRef<string[]>([]);
  useSyncNodes(ornateViewer.current, nodes, isInitialized);
  const previousDocuments = usePrevious(documents);

  // Setup Ornate
  useEffect(() => {
    if (ornateViewer.current) {
      return;
    }

    ornateViewer.current = new CogniteOrnate({
      container: `#${componentContainerId}`,
      shouldShowImagesWhenZoomedOut: true,
    });

    // Shamefully set the shape settings here.
    // Ideally should be specified with the tools themselves
    ornateViewer.current.handleShapeSettingsChange({
      text: {
        fontSize: 26,
        fill: '#ff0000',
      },
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
    const previousPdfExternalIds =
      previousDocuments?.map((document) => document.pdfExternalId) ?? [];
    const currentPdfExternalIds = documents.map(
      (document) => document.pdfExternalId
    );

    const removedPdfExternalIds = previousPdfExternalIds.filter(
      (pdfExternalId) => !currentPdfExternalIds.includes(pdfExternalId)
    );

    removedPdfExternalIds.forEach((pdfExternalId) => {
      ornateViewer.current?.stage
        .findOne(`#${getKonvaSelectorSlugByExternalId(pdfExternalId)}`)
        ?.destroy();
      ornateViewer.current?.stage
        .findOne(
          `#${getKonvaSelectorSlugByExternalId(pdfExternalId)}-label-group`
        )
        ?.destroy();
      addedPdfExternalIds.current = addedPdfExternalIds.current.filter(
        (addedPdfExternalId) =>
          addedPdfExternalId !== getKonvaSelectorSlugByExternalId(pdfExternalId)
      );
    });
  }, [documents]);

  useEffect(() => {
    (async () => {
      const ornateRef = ornateViewer.current;

      console.log(addedPdfExternalIds.current);

      if (ornateRef && documents?.length) {
        await Promise.all(
          documents.map(
            async ({
              id,
              pageNumber,
              row = 1,
              column = 1,
              type,
              name,
              pdfExternalId,
              pdf,
            }) => {
              // Note: Should Ornate keep track of this instead?
              if (addedPdfExternalIds.current.includes(id)) {
                return;
              }
              addedPdfExternalIds.current.push(id);
              const x = (column - 1) * (SLIDE_WIDTH + SLIDE_COLUMN_GAP);
              const y = (row - 1) * (SHAMEFUL_SLIDE_HEIGHT + SLIDE_ROW_GAP);

              await ornateRef?.addPDFDocument(
                pdf,
                pageNumber,
                {
                  pdfExternalId,
                },
                {
                  zoomAfterLoad: false,
                  initialPosition: {
                    // Use column and row to determine positioning
                    x,
                    y,
                  },
                  width: SLIDE_WIDTH,
                  height: SHAMEFUL_SLIDE_HEIGHT,
                  groupId: id,
                  shouldCenterOnDoubleClick: false,
                  unselectable: true,
                }
              );

              const documentLabelGroup = new Konva.Group({
                id: `${getKonvaSelectorSlugByExternalId(id)}-label-group`,
                x,
                y: 0,
              });

              // Note: The styling values here don't match the design since the
              // values in the design don't transfer directly to Konva.
              // Particularly fontSize and fontWeight.
              const documentLabelType = new Konva.Text({
                text: `${type.toUpperCase()} - `,
                fontSize: 36,
                fontFamily: 'Inter',
                lineHeight: 1.4,
                fill: 'rgba(0,0,0,0.45)',
                x: 0,
                y: 0,
              });

              const documentLabelTypeClientRect =
                documentLabelType.getClientRect();

              const documentLabelName = new Konva.Text({
                text: name,
                fontSize: 36,
                fontStyle: 'bold',
                fontFamily: 'Inter',
                lineHeight: 1.4,
                fill: 'rgba(0,0,0,0.45)',
                x: documentLabelTypeClientRect.width,
                y: 0,
              });

              documentLabelGroup.add(documentLabelType);
              documentLabelGroup.add(documentLabelName);

              const documentLabelGroupClientRect =
                documentLabelGroup.getClientRect();

              documentLabelGroup.y(y - documentLabelGroupClientRect.height);

              if (onRemovePress) {
                const removeButton = new Konva.Text({
                  text: 'Remove',
                  fontSize: 36,
                  fontFamily: 'Inter',
                  lineHeight: 1.4,
                  fill: 'rgba(0,0,0,0.45)',
                  x: SLIDE_WIDTH - 170,
                  y: 0,
                });

                removeButton.on('click', () => onRemovePress(pdfExternalId));

                documentLabelGroup.add(removeButton);
              }

              ornateRef.baseLayer.add(documentLabelGroup);
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
      setTimeout(() => {
        // This is a temporary solution as the logic for adding/removing PDFs will be changing
        // soon
        ornateViewer.current?.zoomToGroup(ornateViewer.current?.baseLayer, {
          scaleFactor: 0.95,
        });
      }, 200);
    }
  }, [isInitialized, documents]);

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
