import { Button } from '@cognite/cogs.js';
import { CogniteOrnate, Drawing } from '@cognite/ornate';
import { useAuthContext } from '@cognite/react-container';
import { KonvaEventObject } from 'konva/lib/Node';
import keyBy from 'lodash/keyBy';
import sortBy from 'lodash/sortBy';
import React, { useEffect, useState } from 'react';
import layers from 'utils/z';
import styled from 'styled-components';

import { getDocumentUrlByExternalId } from '../../modules/lineReviews/api';
import WorkSpaceTools from '../WorkSpaceTools/WorkSpaceTools';
import {
  Annotation,
  AnnotationType,
  DocumentType,
  LineReview,
  Link,
  ParsedDocument,
} from '../../modules/lineReviews/types';

import centerOnAnnotationByAnnotationId from './centerOnIsoAnnotationByPidAnnotation';
import { BOUNDING_BOX_PADDING_PX } from './constants';
import getAnnotationBoundingBoxOverlay from './getAnnotationBoundingBoxOverlay';
import getAnnotationsForLineByDocument from './getAnnotationsForLineByDocument';
import getDocumentByExternalId from './getDocumentByExternalId';
import getKonvaSelectorSlugByExternalId from './getKonvaSelectorSlugByExternalId';
import getLinksByAnnotationId from './getLinksByAnnotationId';
import mapPathToNewCoordinateSystem from './mapPathToNewCoordinateSystem';
import padBoundingBoxByPixels from './padBoundingBoxByPixels';
import ReactOrnate, { SHAMEFUL_SLIDE_HEIGHT, SLIDE_WIDTH } from './ReactOrnate';
import useDimensions from './useDimensions';
import { WorkspaceTool } from './useWorkspaceTools';
import withoutFileExtension from './withoutFileExtension';

const INITIAL_WIDTH = 643;
const INITIAL_HEIGHT = 526;
const MODAL_PADDING_TOP = 20;
const RESIZABLE_CORNER_SIZE = 15;

const findCenterLink = (links: Link[], annotations: Annotation[]): Link => {
  if (links.length === 1) {
    return links[0];
  }

  const annotationsById = keyBy(annotations, (annotation) => annotation.id);
  const linksAnnotations = sortBy(
    links.map<[Link, Annotation]>((link) => [
      link,
      annotationsById[link.to.annotationId],
    ]),
    ([, annotation]) => annotation.boundingBox.y
  );

  return links[Math.floor(linksAnnotations.length / 2)];
};

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  cursor: text;
`;

const Title = styled.div`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  /* identical to box height, or 125% */

  display: flex;
  align-items: center;
`;

const FileNames = styled.div`
  /* Text / Detail Strong */

  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  /* identical to box height, or 133% */

  display: flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.45);
`;

const HeaderContainer = styled.div`
  padding: 13px 12px 13px 16px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  cursor: move;
`;

type IsoModalProps = {
  documents: ParsedDocument[] | undefined;
  isoDocuments: ParsedDocument[] | undefined;
  visible?: boolean;
  onHidePress: () => void;
  onOrnateRef: (ref: CogniteOrnate | undefined) => void;
  tool: WorkspaceTool;
  onToolChange: (tool: WorkspaceTool) => void;
  lineReview: LineReview;
  ornateRef: CogniteOrnate | undefined;
};

const getFileConnectionLine = (
  document: ParsedDocument,
  annotationId: string
): Drawing[] => {
  const annotationsById = keyBy(
    document.annotations,
    (annotation) => annotation.id
  );
  const links = document.linking.filter(
    ({ from, to }) =>
      from.documentId === document.externalId &&
      to.documentId === document.externalId &&
      annotationsById[from.annotationId]?.type ===
        AnnotationType.FILE_CONNECTION &&
      annotationsById[to.annotationId]?.type ===
        AnnotationType.FILE_CONNECTION &&
      (from.annotationId === annotationId || to.annotationId === annotationId)
  );

  return links.map(({ from, to }) => {
    const fromAnnotation = annotationsById[from.annotationId];
    const toAnnotation = annotationsById[to.annotationId];

    const fromAnnotationBox = padBoundingBoxByPixels(
      mapPathToNewCoordinateSystem(
        document.viewBox,
        fromAnnotation.boundingBox,
        {
          width: SLIDE_WIDTH,
          height: SHAMEFUL_SLIDE_HEIGHT,
        }
      ),
      3
    );

    const toAnnotationBox = padBoundingBoxByPixels(
      mapPathToNewCoordinateSystem(document.viewBox, toAnnotation.boundingBox, {
        width: SLIDE_WIDTH,
        height: SHAMEFUL_SLIDE_HEIGHT,
      }),
      3
    );

    return {
      groupId: getKonvaSelectorSlugByExternalId(document.externalId),
      id: `${from.annotationId}-${to.annotationId}`,
      type: 'line',
      attrs: {
        id: `${from.annotationId}-${to.annotationId}`,
        points: [
          fromAnnotationBox.x + fromAnnotationBox.width / 2,
          fromAnnotationBox.y + fromAnnotationBox.height / 2,
          toAnnotationBox.x + toAnnotationBox.width / 2,
          toAnnotationBox.y + toAnnotationBox.height / 2,
        ],
        strokeWidth: 3,
        dash: [3, 3],
        stroke: 'rgba(0, 0, 200, 0.4)',
        strokeScaleEnabled: false,
        draggable: false,
        unselectable: true,
      },
    };
  });
};

const IsoModal: React.FC<IsoModalProps> = ({
  documents,
  isoDocuments,
  visible,
  onOrnateRef,
  onHidePress,
  tool,
  onToolChange,
  lineReview,
  ornateRef,
}) => {
  const [isoOrnateRef, setIsoOrnateRef] = useState<CogniteOrnate | undefined>(
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
  const [
    hoveredFileConnectionAnnotationId,
    setHoveredFileConnectionAnnotationId,
  ] = useState<string | undefined>(undefined);

  useEffect(() => {
    onOrnateRef(isoOrnateRef);
  }, [isoOrnateRef]);

  useEffect(() => {
    if (client !== undefined && isoDocuments) {
      (async () => {
        const result = await Promise.all(
          isoDocuments.map(async (document, index) => ({
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

  const onLinkClick = (
    event: KonvaEventObject<MouseEvent>,
    annotationId: string
  ) => {
    if (!isoDocuments || !documents) {
      return;
    }

    const links = [
      ...getLinksByAnnotationId(isoDocuments, annotationId),
      ...getLinksByAnnotationId(isoDocuments, annotationId, true),
    ];
    if (links.length === 0) {
      console.warn(
        `No link found for ${annotationId}`,
        isoDocuments.filter((document) =>
          document.linking.some(
            (link) =>
              link.from.annotationId === annotationId ||
              link.to.annotationId === annotationId
          )
        )
      );
      return;
    }

    const link = findCenterLink(
      links,
      documents.flatMap((document) => document.annotations)
    );
    const isLinkedAnnotationInIso =
      getDocumentByExternalId(documents, link.to.documentId).type ===
      DocumentType.ISO;

    centerOnAnnotationByAnnotationId(
      documents,
      isLinkedAnnotationInIso ? isoOrnateRef : ornateRef,
      link.to.annotationId
    );
  };

  const annotationsById = keyBy(
    isoDocuments?.flatMap((document) => document.annotations),
    (annotation) => annotation.id
  );

  const drawings = isoDocuments?.flatMap((document) => [
    ...getAnnotationBoundingBoxOverlay(
      lineReview.id,
      document,
      document.linking
        .map(({ from: { annotationId } }) => annotationId)
        .filter(
          (id) => annotationsById[id]?.type === AnnotationType.FILE_CONNECTION
        ),
      'navigatable',
      {
        padding: BOUNDING_BOX_PADDING_PX,
        fill: 'rgba(24, 175, 142, 0.2)',
        stroke: '#00665C',
        strokeWidth: 3,
        dash: [3, 3],
      }
    ),
    ...getAnnotationBoundingBoxOverlay(
      lineReview.id,
      document,
      document.linking.map(({ to: { annotationId } }) => annotationId),
      // .filter(
      //   (id) => annotationsById[id]?.type === AnnotationType.FILE_CONNECTION
      // ),
      'navigatable',
      {
        fill: 'rgba(24, 175, 142, 0.2)',
        stroke: '#00665C',
        strokeWidth: 3,
        dash: [3, 3],
        padding: BOUNDING_BOX_PADDING_PX,
      }
    ),
    ...getAnnotationBoundingBoxOverlay(
      lineReview.id,
      document,
      getAnnotationsForLineByDocument(lineReview.id, document).map(
        (annotation) => annotation.id
      ),
      '',
      {
        padding: BOUNDING_BOX_PADDING_PX,
        stroke: 'transparent',
        strokeWidth: 6,
      },
      onLinkClick,
      (event, annotationId) =>
        setHoveredFileConnectionAnnotationId(annotationId),
      () => setHoveredFileConnectionAnnotationId(undefined)
    ),
    ...(hoveredFileConnectionAnnotationId === undefined
      ? []
      : getFileConnectionLine(document, hoveredFileConnectionAnnotationId)),
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
        borderRadius: 12,
        zIndex: layers.ISO_MODAL,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow:
          '0px 8px 16px 4px rgba(0, 0, 0, 0.04), 0px 2px 12px rgba(0, 0, 0, 0.08)',
      }}
    >
      <HeaderContainer
        onMouseDown={onMove}
        role="button"
        tabIndex={-1}
        aria-label="Move"
      >
        <TitleContainer onMouseDown={(e) => e.stopPropagation()}>
          <Title>Isometric drawing</Title>
          <FileNames>
            {isoDocuments
              ?.map(({ pdfExternalId }) => withoutFileExtension(pdfExternalId))
              .join(', ')}
          </FileNames>
        </TitleContainer>
        <Button icon="Close" type="ghost" onClick={onHidePress} />
      </HeaderContainer>
      <div
        style={{
          width: '100%',
          flexBasis: 0,
          flexGrow: 1,
          flexShrink: 1,
          borderTop: '1px solid rgba(0, 0, 0, 0.15)',
          borderRadius: '4px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <ReactOrnate
          onOrnateRef={(ref) => setIsoOrnateRef(ref)}
          documents={fetchedDocuments}
          nodes={drawings}
          renderWorkspaceTools={(ornate, isFocused) => (
            <WorkSpaceTools
              tool={tool}
              enabledTools={[WorkspaceTool.MOVE]}
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
          height: MODAL_PADDING_TOP,
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
