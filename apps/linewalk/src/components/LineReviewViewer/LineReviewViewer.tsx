/* eslint-disable no-underscore-dangle */
import { Button } from '@cognite/cogs.js';
import { CogniteOrnate, Drawing } from '@cognite/ornate';
import { useAuthContext } from '@cognite/react-container';
import { KonvaEventObject } from 'konva/lib/Node';
import { Document, DocumentType, LineReview } from 'modules/lineReviews/types';
import { useEffect, useState } from 'react';
import layers from 'utils/z';

import { getDocumentUrl } from '../../modules/lineReviews/api';
import { DocumentId } from '../../modules/lineReviews/DocumentId';
import delayMs from '../../utils/delayMs';
import getFileConnectionGroups from '../../utils/getFileConnectionDrawings';
import isNotUndefined from '../../utils/isNotUndefined';
import KeyboardShortcut from '../KeyboardShortcut/KeyboardShortcut';

import DiscrepancyModal from './DiscrepancyModal';
import getAnnotationsByDocument from './getAnnotationsByDocument';
import getDiscrepancyCircleMarkersForDocument from './getDiscrepancyCircleMarkersForDocument';
import getFileConnections from './getFileConnections';
import getIsoLinkByPidAnnotationId from './getIsoLinkByPidAnnotationId';
import IsoModal from './IsoModal';
import mapPathToNewCoordinateSystem from './mapPathToNewCoordinateSystem';
import ReactOrnate, {
  ReactOrnateProps,
  SHAMEFUL_SLIDE_HEIGHT,
  SLIDE_COLUMN_GAP,
  SLIDE_ROW_GAP,
  SLIDE_WIDTH,
} from './ReactOrnate';

type LineReviewViewerProps = {
  lineReview: LineReview;
  discrepancies: Discrepancy[];
  onDiscrepancyChange: (discrepancies: Discrepancy[]) => void;
  onOrnateRef: (ref: CogniteOrnate | undefined) => void;
};

const mapPidAnnotationIdToIsoAnnotationId = (
  documents: Document[],
  pidAnnotationId: string
) => {
  const link = documents
    .flatMap(({ _linking }) => _linking)
    .find(({ from: { instanceId } }) => instanceId === pidAnnotationId);

  if (link === undefined) {
    return undefined;
  }

  return link.to.instanceId;
};

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAnnotationBoundingBox = (
  document: Document,
  annotationIds: string[],
  prefix: string,
  stroke = 'rgba(0,0,255,0.3)',
  fill = 'rgba(0,0,255,0.1)'
): Drawing[] =>
  getAnnotationsByDocument(document)
    .filter(({ id }) => annotationIds.includes(id))
    .map((d) => {
      return {
        groupId: document.id,
        id: `${prefix}-${d.id}`,
        type: 'rect',
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
          unselectable: false,
          data: d.svgRepresentation.svgPaths
            .map(({ svgCommands }) => svgCommands)
            .join(' '),
          stroke,
          fill,
        },
      };
    });

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
  discrepancies,
  onDiscrepancyChange,
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
  const [pendingDiscrepancy, setPendingDiscrepancy] =
    useState<Discrepancy | null>(null);
  const [isAltPressed, setIsAltPressed] = useState(false);
  const { client } = useAuthContext();
  const [ornateRef, setOrnateRef] = useState<CogniteOrnate | undefined>(
    undefined
  );
  const [selectedFileConnectionId, setSelectedFileConnectionId] = useState<
    string | undefined
  >(undefined);

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

    const isoLink = getIsoLinkByPidAnnotationId(documents, pidAnnotationId);
    if (!isoLink) {
      console.log('Could not find iso link for annotationId', pidAnnotationId);
      return;
    }

    const isoDocuments = documents.filter(
      ({ type }) => type === DocumentType.ISO
    );

    const isoDocumentIndex = isoDocuments.findIndex(
      ({ id }) => id === isoLink.to.documentId
    );

    if (isoDocumentIndex === -1) {
      console.error('Couldnt find ISO document');
    }

    const isoDocument = isoDocuments[isoDocumentIndex];

    if (!isoDocument) {
      console.error('No ISO document available');
      return;
    }

    const isoBoundingBox = findBoundingBoxByPathId(
      isoDocument,
      isoLink.to.instanceId
    );
    if (!isoBoundingBox) {
      console.log(
        'Could not find isoBoundingBox for isoPathId',
        isoLink.to.instanceId
      );
      return;
    }

    const shamefulHorizontalOffset =
      (SLIDE_WIDTH + SLIDE_COLUMN_GAP) * isoDocumentIndex;

    isoOrnateRef.zoomToLocation(
      {
        x: -(
          shamefulHorizontalOffset +
          isoBoundingBox.x +
          isoBoundingBox.scale.x / 2
        ),
        y: -(isoBoundingBox.y + isoBoundingBox.scale.y / 2),
      },
      0.7,
      1
    );

    const drawings: Drawing[] = isoDocument._annotations.symbolInstances
      .filter(({ id }) => id === isoLink.to.instanceId)
      .map((d) => {
        const mappedCoordinates = mapPathToNewCoordinateSystem(
          // TODOO: Handle multiple ISOs
          isoDocument._annotations.viewBox,
          d.svgRepresentation.boundingBox,
          { width: SLIDE_WIDTH, height: SHAMEFUL_SLIDE_HEIGHT }
        );
        return {
          id: `flash-${d.id}`,
          type: 'path',
          attrs: {
            id: `flash-${d.id}`,
            ...mappedCoordinates,
            x: mappedCoordinates.x + shamefulHorizontalOffset,
            y: mappedCoordinates.y,
            // width: mappedCoordinates.scale.x,
            // height: mappedCoordinates.scale.y,
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
            inGroup: isoDocument.id,
          },
        };
      });

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
    onDiscrepancyChange(
      discrepancies.filter(({ id }) => id !== pendingDiscrepancy.id)
    );
  };

  const onSaveDiscrepancy = (discrepancy: Discrepancy) => {
    onDiscrepancyChange([
      ...discrepancies.filter((d) => d.id !== discrepancy.id),
      discrepancy,
    ]);
    setSelectedAnnotationIds([]);
    setIsDiscrepancyModalOpen(false);
  };

  const allSymbolInstances = lineReview.documents.flatMap(
    ({ _annotations }) => _annotations.symbolInstances
  );

  const getSymbolNameByPathId = (pathId: string): string | undefined => {
    const symbolInstance = allSymbolInstances.find(({ id }) => id === pathId);

    if (symbolInstance === undefined) {
      return undefined;
    }

    return symbolInstance.symbolName;
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
      // ...getAnnotationOverlay(
      //   document,
      //   getAnnotationsByDocument(document).map(({ id }) => id),
      //   'debug-paths',
      //   'green'
      // ),
      // ...(document._linking
      //   ? getAnnotationOverlay(
      //       document,
      //       document._linking.map(({ from: { instanceId } }) => instanceId),
      //       'debug-navigatable',
      //       'lightblue'
      //     )
      //   : []),
      // ...getAnnotationBoundingBox(
      //   document,
      //   document._annotations.symbolInstances
      //     .filter(({ symbolName }) => symbolName === 'fileConnection')
      //     .map(({ id }) => id),
      //   'debug-fileConnection-'
      // ),
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
      ...getDiscrepancyCircleMarkersForDocument(
        document,
        discrepancies,
        (discrepancy) => {
          setPendingDiscrepancy(discrepancy);
          setIsDiscrepancyModalOpen(true);
        }
      ),
      ...(isAltPressed && document._linking
        ? getAnnotationOverlay(
            document,
            document._linking
              .map(({ from: { instanceId } }) => instanceId)
              .filter((id) => getSymbolNameByPathId(id) !== 'fileConnection'),
            'navigatable',
            'blue'
          )
        : []),
      ...getInteractableOverlays(document, onAnnotationClick),
    ];
  };

  const drawings = [
    ...lineReview.documents
      .filter(({ type }) => type === DocumentType.PID)
      .flatMap((document) =>
        getDrawingsByDocumentId(lineReview.documents, document.id)
      ),
  ];

  const groups = ornateRef
    ? getFileConnectionGroups({
        ornateViewer: ornateRef,
        connections: getFileConnections(lineReview),
        columnGap: SLIDE_COLUMN_GAP,
        rowGap: SLIDE_ROW_GAP,
        onSelect: (id: string) =>
          selectedFileConnectionId === id
            ? setSelectedFileConnectionId(undefined)
            : setSelectedFileConnectionId(id),
        selectedId: selectedFileConnectionId,
      })
    : [];

  console.log('selected', selectedFileConnectionId);

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
        documents={lineReview.documents.filter(
          ({ type }) => type === DocumentType.ISO
        )}
        discrepancies={discrepancies.map((discrepancy) => ({
          ...discrepancy,
          ids: discrepancy.ids
            .map((id) =>
              mapPidAnnotationIdToIsoAnnotationId(lineReview.documents, id)
            )
            .filter(isNotUndefined),
        }))}
        visible={isIsoModalOpen}
        onOrnateRef={setIsoOrnateRef}
        onHidePress={() => setIsIsoModalOpen(false)}
      />
      <div
        style={{ height: 'calc(100vh - 125px - 56px)', position: 'relative' }}
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
          groups={groups}
          drawings={drawings}
          onOrnateRef={(ref) => {
            setOrnateRef(ref);
            onOrnateRef(ref);
          }}
        />
      </div>
    </>
  );
};

export default LineReviewViewer;
