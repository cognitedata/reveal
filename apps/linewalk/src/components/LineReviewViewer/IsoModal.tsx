import { Button } from '@cognite/cogs.js';
import { CogniteOrnate } from '@cognite/ornate';
import { useAuthContext } from '@cognite/react-container';
import { KonvaEventObject } from 'konva/lib/Node';
import keyBy from 'lodash/keyBy';
import React, { useEffect, useState } from 'react';
import layers from 'utils/z';

import { getDocumentUrlByExternalId } from '../../modules/lineReviews/api';
import WorkSpaceTools from '../WorkSpaceTools/WorkSpaceTools';
import {
  AnnotationType,
  LineReview,
  ParsedDocument,
} from '../../modules/lineReviews/types';

import centerOnAnnotationByAnnotationId from './centerOnIsoAnnotationByPidAnnotation';
import getAnnotationOverlay from './getAnnotationOverlay';
import getAnnotationsForLineByDocument from './getAnnotationsForLineByDocument';
import getDiscrepancyCircleMarkersForDocument from './getDiscrepancyCircleMarkersForDocument';
import getKonvaSelectorSlugByExternalId from './getKonvaSelectorSlugByExternalId';
import getLinkByAnnotationId from './getLinkByAnnotationId';
import { Discrepancy } from './LineReviewViewer';
import ReactOrnate from './ReactOrnate';
import useDimensions from './useDimensions';
import { WorkspaceTool } from './useWorkspaceTools';
import withoutFileExtension from './withoutFileExtension';

const INITIAL_WIDTH = 643;
const INITIAL_HEIGHT = 526;

type IsoModalProps = {
  documents: ParsedDocument[] | undefined;
  visible?: boolean;
  discrepancies: Discrepancy[];
  onHidePress: () => void;
  onOrnateRef: (ref: CogniteOrnate | undefined) => void;
  tool: WorkspaceTool;
  onToolChange: (tool: WorkspaceTool) => void;
  lineReview: LineReview;
};

const RESIZABLE_CORNER_SIZE = 15;

const IsoModal: React.FC<IsoModalProps> = ({
  documents,
  visible,
  discrepancies,
  onOrnateRef,
  onHidePress,
  tool,
  onToolChange,
  lineReview,
}) => {
  const [ornateRef, setOrnateRef] = useState<CogniteOrnate | undefined>(
    undefined
  );
  const [modalRef, setModalRef] = useState<HTMLElement | null>(null);
  const { client } = useAuthContext();
  const [fetchedDocuments, setFetchedDocuments] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const {
    dimensions,
    onMove,
    onResizeBottomRight,
    onResizeBottomLeft,
    onResizeTopLeft,
    onResizeTopRight,
  } = useDimensions(modalRef, {
    width: INITIAL_WIDTH,
    height: INITIAL_HEIGHT,
    x: window.innerWidth - INITIAL_WIDTH - Math.round(window.innerWidth * 0.02),
    y: Math.round(window.innerHeight * 0.02),
  });

  useEffect(() => {
    onOrnateRef(ornateRef);
  }, [ornateRef]);

  useEffect(() => {
    if (client !== undefined && documents) {
      (async () => {
        const result = await Promise.all(
          documents.map(async (document, index) => ({
            id: getKonvaSelectorSlugByExternalId(document.externalId),
            url: await getDocumentUrlByExternalId(client)(
              document.pdfExternalId
            ),
            pageNumber: 1,
            row: 1,
            column: index + 1,
            type: document.type,
            name: withoutFileExtension(document.pdfExternalId),
          }))
        );

        setFetchedDocuments(result);
        setIsInitialized(true);
      })();
    }
  }, [document, client]);

  if (!isInitialized) {
    return null;
  }

  const onAnnotationClick = (
    event: KonvaEventObject<MouseEvent>,
    annotationId: string
  ) => {
    if (!documents) {
      return;
    }

    const link =
      getLinkByAnnotationId(documents, annotationId) ??
      getLinkByAnnotationId(documents, annotationId, true);
    if (!link) {
      console.warn(
        `No link found for ${annotationId}`,
        documents.filter((document) =>
          document.linking.some(
            (link) =>
              link.from.annotationId === annotationId ||
              link.to.annotationId === annotationId
          )
        )
      );
      return;
    }

    centerOnAnnotationByAnnotationId(
      documents,
      ornateRef,
      link.to.annotationId
    );
  };

  const annotationsById = keyBy(
    documents?.flatMap((document) => document.annotations),
    (annotation) => annotation.id
  );

  const drawings = documents?.flatMap((document) => [
    ...([WorkspaceTool.LINK].includes(tool)
      ? [
          ...getAnnotationOverlay(
            lineReview.id,
            document,
            document.linking
              .map(({ from: { annotationId } }) => annotationId)
              .filter(
                (id) =>
                  annotationsById[id]?.type === AnnotationType.FILE_CONNECTION
              ),
            'navigatable',
            {
              stroke: '#39A263',
              strokeWidth: 3,
            }
          ),
          ...getAnnotationOverlay(
            lineReview.id,
            document,
            document.linking
              .map(({ to: { annotationId } }) => annotationId)
              .filter(
                (id) =>
                  annotationsById[id]?.type === AnnotationType.FILE_CONNECTION
              ),
            'navigatable',
            {
              stroke: '#39A263',
              strokeWidth: 3,
            }
          ),
        ]
      : []),
    ...getAnnotationOverlay(
      lineReview.id,
      document,
      getAnnotationsForLineByDocument(lineReview.id, document)
        .filter(({ svgPaths }) => svgPaths.length > 0)
        .map((annotation) => annotation.id),
      '',
      {
        stroke: 'transparent',
        strokeWidth: 6,
      },
      [(WorkspaceTool.SELECT, WorkspaceTool.LINK)].includes(tool)
        ? onAnnotationClick
        : undefined
    ),
    ...getDiscrepancyCircleMarkersForDocument(
      lineReview.id,
      document,
      discrepancies
    ),
  ]);

  return (
    <div
      ref={(ref) => setModalRef(ref)}
      style={{
        visibility: visible ? undefined : 'hidden',
        position: 'fixed',
        top: dimensions.y,
        left: dimensions.x,
        width: dimensions.width,
        height: dimensions.height,
        background: 'white',
        border: '1px solid rgba(0, 0, 0, 0.15)',
        borderRadius: 8,
        zIndex: layers.OVERLAY,
        padding: '25px 20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <h2>
          Isometric Drawing{' '}
          {documents
            ?.map(({ pdfExternalId }) => withoutFileExtension(pdfExternalId))
            .join(', ')}
        </h2>
        <div
          style={{
            marginLeft: '16px',
          }}
        >
          <Button onClick={onHidePress}>Hide</Button>
        </div>
      </div>
      <div
        style={{
          width: '100%',
          flexBasis: 0,
          flexGrow: 1,
          flexShrink: 1,
          border: '1px solid rgba(0, 0, 0, 0.15)',
          borderRadius: '4px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <ReactOrnate
          onOrnateRef={(ref) => setOrnateRef(ref)}
          documents={fetchedDocuments}
          nodes={drawings}
          renderWorkspaceTools={(ornate, isFocused) => (
            <WorkSpaceTools
              tool={tool}
              enabledTools={[
                WorkspaceTool.MOVE,
                WorkspaceTool.LINK,
                WorkspaceTool.COMMENT,
              ]}
              onToolChange={onToolChange}
              areKeyboardShortcutsEnabled={isFocused}
            />
          )}
        />
      </div>
      <div
        style={{
          cursor: 'move',
          position: 'absolute',
          top: 0,
          left: RESIZABLE_CORNER_SIZE,
          right: RESIZABLE_CORNER_SIZE,
          height: RESIZABLE_CORNER_SIZE,
        }}
        role="button"
        tabIndex={-1}
        aria-label="Move"
        onMouseDown={onMove}
      />
      <div
        style={{
          cursor: 'nwse-resize',
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: RESIZABLE_CORNER_SIZE,
          height: RESIZABLE_CORNER_SIZE,
        }}
        role="button"
        aria-label="Resize"
        tabIndex={-1}
        onMouseDown={onResizeBottomRight}
      />
      <div
        style={{
          cursor: 'nesw-resize',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: RESIZABLE_CORNER_SIZE,
          height: RESIZABLE_CORNER_SIZE,
        }}
        aria-label="Resize"
        role="button"
        tabIndex={-1}
        onMouseDown={onResizeBottomLeft}
      />
      <div
        style={{
          cursor: 'nwse-resize',
          position: 'absolute',
          top: 0,
          left: 0,
          width: RESIZABLE_CORNER_SIZE,
          height: RESIZABLE_CORNER_SIZE,
        }}
        aria-label="Resize"
        role="button"
        tabIndex={-1}
        onMouseDown={onResizeTopLeft}
      />
      <div
        style={{
          cursor: 'nesw-resize',
          position: 'absolute',
          top: 0,
          right: 0,
          width: RESIZABLE_CORNER_SIZE,
          height: RESIZABLE_CORNER_SIZE,
        }}
        aria-label="Resize"
        role="button"
        tabIndex={-1}
        onMouseDown={onResizeTopRight}
      />
    </div>
  );
};

export default IsoModal;
