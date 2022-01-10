/* eslint-disable no-underscore-dangle */
import { Button } from '@cognite/cogs.js';
import { CogniteOrnate, Drawing } from '@cognite/ornate';
import { useAuthContext } from '@cognite/react-container';
import { KonvaEventObject } from 'konva/lib/Node';
import {
  Document,
  DocumentConnection,
  DocumentType,
  LineReview,
  Link,
} from 'modules/lineReviews/types';
import { useEffect, useState } from 'react';
import layers from 'utils/z';
import head from 'lodash/head';
import sortBy from 'lodash/sortBy';

import { getDocumentUrl } from '../../modules/lineReviews/api';
import { DocumentId } from '../../modules/lineReviews/DocumentId';
import delayMs from '../../utils/delayMs';
import isNotUndefined from '../../utils/isNotUndefined';
import KeyboardShortcut from '../KeyboardShortcut/KeyboardShortcut';

import DiscrepancyModal from './DiscrepancyModal';
import IsoModal, {
  ISO_MODAL_ORNATE_HEIGHT_PX,
  ISO_MODAL_ORNATE_WIDTH_PX,
} from './IsoModal';
import mapPathToNewCoordinateSystem from './mapPathToNewCoordinateSystem';
import ReactOrnate, {
  ReactOrnateProps,
  SHAMEFUL_SLIDE_HEIGHT,
  SLIDE_WIDTH,
} from './ReactOrnate';

type LineReviewViewerProps = {
  lineReview: LineReview;
  onOrnateRef: (ref: CogniteOrnate | undefined) => void;
};

const getAnnotationsByDocument = (document: Document) => [
  ...document._annotations.lines,
  ...document._annotations.symbolInstances,
];

const getInteractableOverlays = (
  document: Document,
  onPathClick: (event: KonvaEventObject<MouseEvent>, pathId: string) => void
): Drawing[] => {
  return getAnnotationsByDocument(document).map((d) => ({
    groupId: document.id,
    id: d.id,
    type: 'path',
    onClick: (event) => onPathClick(event, d.id),
    attrs: {
      ...mapPathToNewCoordinateSystem(
        document._annotations.viewBox,
        d.svgRepresentation.boundingBox,
        { width: SLIDE_WIDTH, height: SHAMEFUL_SLIDE_HEIGHT }
      ),
      id: d.id,
      strokeScaleEnabled: false,
      strokeWidth: 6,
      hitStrokeWidth: 20,
      stroke: 'transparent',
      draggable: false,
      unselectable: true,
      data: d.svgRepresentation.svgPaths
        .map(({ svgCommands }) => svgCommands)
        .join(' '),
    },
  }));
};

const getAnnotationOverlay = (
  document: Document,
  annotationIds: string[],
  prefix: string,
  stroke = 'orange'
): Drawing[] => {
  return getAnnotationsByDocument(document)
    .filter(({ id }) => annotationIds.includes(id))
    .map((d) => ({
      groupId: document.id,
      id: `${prefix}-${d.id}`,
      type: 'path',
      attrs: {
        id: `${prefix}-${d.id}`,
        ...mapPathToNewCoordinateSystem(
          document._annotations.viewBox,
          d.svgRepresentation.boundingBox,
          { width: SLIDE_WIDTH, height: SHAMEFUL_SLIDE_HEIGHT }
        ),
        strokeScaleEnabled: false,
        strokeWidth: 6,
        dash: [6, 6],
        draggable: false,
        unselectable: true,
        data: d.svgRepresentation.svgPaths
          .map(({ svgCommands }) => svgCommands)
          .join(' '),
        stroke,
      },
    }));
};

const RADIUS = 10;
const getDiscrepancyCircleMarkersForDocument = (
  document: Document,
  discrepancies: Discrepancy[]
): Drawing[] =>
  discrepancies
    .map((discrepancy) =>
      head(
        sortBy(
          getAnnotationsByDocument(document)
            .filter(({ id }) => discrepancy.ids.includes(id))
            .map(
              (d) =>
                mapPathToNewCoordinateSystem(
                  document._annotations.viewBox,
                  d.svgRepresentation.boundingBox,
                  { width: SLIDE_WIDTH, height: SHAMEFUL_SLIDE_HEIGHT }
                ),
              ({ y }: { y: number }) => y
            )
        )
      )
    )
    .filter(isNotUndefined)
    .map(({ x, y }: { x: number; y: number }, index) => ({
      groupId: document.id,
      id: `circle-marker-${index}`,
      type: 'circleMarker',
      attrs: {
        id: `circle-marker-${index}`,
        draggable: false,
        unselectable: true,
        pinnedTo: {
          x,
          y,
        },
        number: index + 1,
        radius: RADIUS,
        color: '#CF1A17',
      },
    }));

const findBoundingBoxByPathId = (document: Document, pathId: string) => {
  const datum = document._annotations.symbolInstances.find(
    ({ id }) => id === pathId
  );

  if (!datum) {
    return undefined;
  }

  return mapPathToNewCoordinateSystem(
    document._annotations.viewBox,
    datum.svgRepresentation.boundingBox,
    { width: SLIDE_WIDTH, height: SHAMEFUL_SLIDE_HEIGHT }
  );
};

const getIsoAnnotationIdByPidAnnotationId = (
  linking: Link[],
  pidPathId: string
): string | undefined => {
  const match = linking.find((link) => link['p&id'] === pidPathId);

  if (!match) {
    console.log('Did not find element in ISO corresponding to PID');
    return undefined;
  }

  return match.iso;
};

const connections: DocumentConnection[] = [
  ['CONNECT_ANNOTATION_1', 'CONNECT_ANNOTATION_2'],
  ['CONNECT_ANNOTATION_3', 'CONNECT_ANNOTATION_4'],
];

const flashDrawing = async (
  ornateRef: CogniteOrnate,
  drawing: Drawing,
  times = 3,
  delay = 200
) => {
  for (let i = 0; i < times; i++) {
    ornateRef.addDrawings(drawing);
    // eslint-disable-next-line no-await-in-loop
    await delayMs(delay);
    if (drawing.id) {
      ornateRef.removeShapeById(drawing.id);
    }
    // eslint-disable-next-line no-await-in-loop
    await delayMs(delay);
  }
};

export type Discrepancy = {
  id: string;
  ids: string[];
  comment: string;
  createdAt: Date;
};

const LineReviewViewer: React.FC<LineReviewViewerProps> = ({
  lineReview,
  onOrnateRef,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [documents, setDocuments] = useState<
    ReactOrnateProps['documents'] | undefined
  >(undefined);
  const [isDiscrepancyModalOpen, setIsDiscrepancyModalOpen] = useState(false);
  const [isIsoModalOpen, setIsIsoModalOpen] = useState(false);
  const [selectedAnnotationIds, setSelectedAnnotationIds] = useState<string[]>(
    []
  );
  const [isoOrnateRef, setIsoOrnateRef] = useState<CogniteOrnate | undefined>(
    undefined
  );
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);
  const [pendingDiscrepancy, setPendingDiscrepancy] =
    useState<Discrepancy | null>(null);
  const [isAltPressed, setIsAltPressed] = useState(false);
  const { client } = useAuthContext();

  useEffect(() => {
    (async () => {
      setDocuments(
        await Promise.all([
          ...lineReview.documents
            .filter(({ type }) => type === DocumentType.PID)
            .map(async (document, index) => ({
              id: document.id,
              url: await getDocumentUrl(client, document),
              pageNumber: 1,
              annotations: document.annotations,
              row: 1,
              column: index + 1,
            })),
          ...lineReview.documents
            .filter(({ type }) => type === DocumentType.ISO)
            .map(async (document, index) => ({
              id: document.id,
              url: await getDocumentUrl(client, document),
              pageNumber: 1,
              annotations: document.annotations,
              row: 2,
              column: index + 2,
            })),
        ])
      );

      setIsInitialized(true);
    })();
  }, []);

  if (!isInitialized || !documents) {
    return null;
  }

  const toggleAnnotationSelection = (annotationId: string) =>
    setSelectedAnnotationIds((annotationIds: string[]) => {
      if (annotationIds.includes(annotationId)) {
        return annotationIds.filter((id) => id !== annotationId);
      }

      // The annotations are sorted because we join their ids to be the id
      // of the discrepancy
      return [...annotationIds, annotationId].sort();
    });

  const centerOnIsoAnnotationByPidAnnotationId = (
    documents: Document[],
    pidAnnotationId: string
  ) => {
    if (!isIsoModalOpen) {
      setIsIsoModalOpen(true);
    }

    if (!isoOrnateRef) {
      console.log('isoOrnateRef was not defined, exiting early');
      return;
    }

    const linking = documents
      .filter(({ type }) => type === DocumentType.PID)
      .flatMap(({ _linking }) => _linking);

    const isoPathId = getIsoAnnotationIdByPidAnnotationId(
      linking,
      pidAnnotationId
    );
    if (!isoPathId) {
      console.log('Could not find isoPathId for annotationId', pidAnnotationId);
      return;
    }

    // TODOO: Handle multiple ISOs
    const isoDocument = documents.find(({ type }) => type === DocumentType.ISO);

    if (!isoDocument) {
      console.error('No ISO document available');
      return;
    }

    const isoBoundingBox = findBoundingBoxByPathId(isoDocument, isoPathId);
    if (!isoBoundingBox) {
      console.log('Could not find isoBoundingBox for isoPathId', isoPathId);
      return;
    }

    isoOrnateRef.zoomToLocation(
      {
        x: ISO_MODAL_ORNATE_WIDTH_PX / 2 - isoBoundingBox.x,
        y: ISO_MODAL_ORNATE_HEIGHT_PX / 2 - isoBoundingBox.y,
      },
      1
    );

    const drawings: Drawing[] = isoDocument._annotations.symbolInstances
      .filter(({ id }) => id === isoPathId)
      .map((d) => ({
        id: `flash-${d.id}`,
        type: 'path',
        attrs: {
          id: `flash-${d.id}`,
          ...mapPathToNewCoordinateSystem(
            // TODOO: Handle multiple ISOs
            isoDocument._annotations.viewBox,
            d.svgRepresentation.boundingBox,
            { width: SLIDE_WIDTH, height: SHAMEFUL_SLIDE_HEIGHT }
          ),
          strokeScaleEnabled: false,
          strokeWidth: 4,
          dash: [1, 1],
          draggable: false,
          unselectable: true,
          lineJoin: 'bevel',
          data: d.svgRepresentation.svgPaths
            .map(({ svgCommands }) => svgCommands)
            .join(' '),
          stroke: 'blue',
        },
      }));

    if (drawings.length <= 0) {
      return;
    }

    if (isoOrnateRef) {
      flashDrawing(isoOrnateRef, drawings[0]);
    }
  };

  const onAnnotationClick = (
    { evt }: KonvaEventObject<MouseEvent>,
    annotationId: string
  ): void => {
    console.log('Clicked');
    if (evt.shiftKey) {
      toggleAnnotationSelection(annotationId);
      return;
    }

    if (evt.altKey) {
      centerOnIsoAnnotationByPidAnnotationId(
        lineReview.documents,
        annotationId
      );
      return;
    }

    const foundDiscrepancy = discrepancies.find((discrepancy) =>
      discrepancy.ids.includes(annotationId)
    );
    if (foundDiscrepancy) {
      setPendingDiscrepancy(foundDiscrepancy);
      setIsDiscrepancyModalOpen(true);
      return;
    }

    if (selectedAnnotationIds.length > 0) {
      setPendingDiscrepancy({
        id: selectedAnnotationIds.join('-'),
        ids: selectedAnnotationIds,
        comment: '',
        createdAt: new Date(),
      });
      setIsDiscrepancyModalOpen(true);
    }
  };

  const onDeletePendingDiscrepancy = () => {
    setSelectedAnnotationIds([]);
    setIsDiscrepancyModalOpen(false);
    if (!pendingDiscrepancy) {
      return;
    }
    setDiscrepancies((discrepancies) =>
      discrepancies.filter(({ id }) => id !== pendingDiscrepancy.id)
    );
  };

  const onSaveDiscrepancy = (discrepancy: Discrepancy) => {
    setDiscrepancies([
      ...discrepancies.filter((d) => d.id !== discrepancy.id),
      discrepancy,
    ]);
    setSelectedAnnotationIds([]);
    setIsDiscrepancyModalOpen(false);
  };

  const getDrawingsByDocumentId = (
    documents: Document[],
    documentId: DocumentId
  ) => {
    const document = documents.find((document) => document.id === documentId);

    if (document === undefined) {
      console.warn("Document didn't exist");
      return [];
    }

    return [
      ...document._opacities,
      ...getAnnotationOverlay(
        document,
        selectedAnnotationIds,
        'current-selection'
      ),
      ...discrepancies.flatMap((discrepancy) =>
        getAnnotationOverlay(
          document,
          discrepancy.ids,
          discrepancy.id,
          '#CF1A17'
        )
      ),
      ...getDiscrepancyCircleMarkersForDocument(document, discrepancies),
      ...(isAltPressed && document._linking
        ? getAnnotationOverlay(
            document,
            document._linking.map((link) => link['p&id']),
            'navigatable',
            'blue'
          )
        : []),
      ...getInteractableOverlays(document, onAnnotationClick),
    ];
  };

  const drawings = [
    ...[
      ...lineReview.documents.filter(({ type }) => type === DocumentType.PID),
    ].flatMap((document) =>
      getDrawingsByDocumentId(lineReview.documents, document.id)
    ),
  ];

  return (
    <>
      {isDiscrepancyModalOpen && pendingDiscrepancy && (
        <DiscrepancyModal
          initialDiscrepancy={pendingDiscrepancy}
          isOpen={isDiscrepancyModalOpen}
          onClosePress={() => {
            setIsDiscrepancyModalOpen(false);
          }}
          onDeletePress={onDeletePendingDiscrepancy}
          onSave={onSaveDiscrepancy}
        />
      )}

      <IsoModal
        document={lineReview.documents.find(
          ({ type }) => type === DocumentType.ISO
        )}
        visible={isIsoModalOpen}
        onOrnateRef={setIsoOrnateRef}
        onHidePress={() => setIsIsoModalOpen(false)}
      />
      <div
        style={{ height: 'calc(100vh - 180px - 60px)', position: 'relative' }}
      >
        {!isIsoModalOpen && (
          <div
            style={{
              position: 'absolute',
              right: 20,
              top: 20,
              zIndex: layers.OVERLAY,
            }}
          >
            <Button
              onClick={() => {
                setIsIsoModalOpen(true);
              }}
            >
              Open ISO
            </Button>
          </div>
        )}
        <KeyboardShortcut
          keys="alt"
          onKeyDown={() => setIsAltPressed(true)}
          onKeyRelease={() => setIsAltPressed(false)}
        />
        <ReactOrnate
          documents={documents}
          drawings={drawings}
          connections={connections}
          onOrnateRef={onOrnateRef}
        />
      </div>
    </>
  );
};

export default LineReviewViewer;
