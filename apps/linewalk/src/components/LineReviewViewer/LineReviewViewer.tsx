import { Button } from '@cognite/cogs.js';
import { CogniteOrnate } from '@cognite/ornate';
import { useAuthContext } from '@cognite/react-container';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import {
  ParsedDocument,
  DocumentType,
  LineReview,
} from 'modules/lineReviews/types';
import { useEffect, useState } from 'react';
import layers from 'utils/z';

import { getDocumentUrlByExternalId } from '../../modules/lineReviews/api';
import getFileConnectionGroups from '../../utils/getFileConnectionDrawings';
import isNotUndefined from '../../utils/isNotUndefined';
import WorkSpaceTools from '../WorkSpaceTools';

import centerOnAnnotationByAnnotationId from './centerOnIsoAnnotationByPidAnnotation';
import DiscrepancyModal from './DiscrepancyModal';
import DocumentJumper from './DocumentJumper';
import getAnnotationOverlay from './getAnnotationOverlay';
import getAnnotationsForLineByDocument from './getAnnotationsForLineByDocument';
import getDiscrepancyCircleMarkersForDocument from './getDiscrepancyCircleMarkersForDocument';
import getDocumentByExternalId from './getDocumentByExternalId';
import getFileConnections from './getFileConnections';
import getLinkByAnnotationId from './getLinkByAnnotationId';
import getKonvaSelectorSlugByExternalId from './getKonvaSelectorSlugByExternalId';
import getOpacityGroupByDocument from './getOpacityGroupByDocument';
import IsoModal from './IsoModal';
import ReactOrnate, {
  ReactOrnateProps,
  SLIDE_COLUMN_GAP,
  SLIDE_ROW_GAP,
} from './ReactOrnate';
import useWorkspaceTools, { WorkspaceTool } from './useWorkspaceTools';
import withoutFileExtension from './withoutFileExtension';

type LineReviewViewerProps = {
  lineReview: LineReview;
  documents: ParsedDocument[];
  discrepancies: Discrepancy[];
  onDiscrepancyChange: (discrepancies: Discrepancy[]) => void;
  onOrnateRef: (ref: CogniteOrnate | undefined) => void;
};

const useDocumentJumper = (
  documents: ParsedDocument[],
  ornateRef: CogniteOrnate | undefined
) => {
  const [jumpToDocumentValue, setJumpToDocumentValue] = useState('');

  const documentJumperOptions = [
    {
      label: 'Jump to document...',
      value: '',
    },

    ...documents.map((document) => ({
      label: `${document.type.toUpperCase()}: ${withoutFileExtension(
        document.pdfExternalId
      )}`,
      value: document.externalId,
    })),
  ];

  useEffect(() => {
    if (ornateRef && jumpToDocumentValue !== '') {
      const node = ornateRef.stage.findOne(
        `#${getKonvaSelectorSlugByExternalId(jumpToDocumentValue)}`
      ) as Konva.Group;
      if (node) {
        ornateRef.zoomToGroup(node, {
          scaleFactor: 0.75,
        });
      }

      setJumpToDocumentValue('');
    }
  }, [jumpToDocumentValue, ornateRef]);

  return {
    documentJumperOptions,
    jumpToDocumentValue,
    setJumpToDocumentValue,
  };
};

const mapPidAnnotationIdToIsoAnnotationId = (
  documents: ParsedDocument[],
  pidAnnotationId: string
) => {
  const link = documents
    .flatMap(({ linking }) => linking)
    .find(({ from: { annotationId } }) => annotationId === pidAnnotationId);

  if (link === undefined) {
    return undefined;
  }

  return link.to.annotationId;
};

export type Discrepancy = {
  id: string;
  ids: string[];
  comment: string;
  createdAt: Date;
};

const DISCREPANCY_MODAL_OFFSET_X = 50;
const DISCREPANCY_MODAL_OFFSET_Y = -50;

const LineReviewViewer: React.FC<LineReviewViewerProps> = ({
  discrepancies,
  documents,
  onDiscrepancyChange,
  lineReview,
  onOrnateRef,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [pdfDocuments, setPdfDocuments] = useState<
    ReactOrnateProps['documents'] | undefined
  >(undefined);

  const [discrepancyModalState, setDiscrepancyModalState] = useState({
    isOpen: false,
    position: {
      x: 0,
      y: 0,
    },
  });

  const [isIsoModalOpen, setIsIsoModalOpen] = useState(false);
  const [selectedAnnotationIds, setSelectedAnnotationIds] = useState<string[]>(
    []
  );
  const [isoOrnateRef, setIsoOrnateRef] = useState<CogniteOrnate | undefined>(
    undefined
  );
  const [pendingDiscrepancy, setPendingDiscrepancy] =
    useState<Discrepancy | null>(null);
  const { client } = useAuthContext();
  const [ornateRef, setOrnateRef] = useState<CogniteOrnate | undefined>(
    undefined
  );
  const { documentJumperOptions, jumpToDocumentValue, setJumpToDocumentValue } =
    useDocumentJumper(documents, ornateRef);
  const [selectedFileConnectionId, setSelectedFileConnectionId] = useState<
    string | undefined
  >(undefined);
  const { tool, onToolChange } = useWorkspaceTools(ornateRef);
  const { tool: isoModalTool, onToolChange: onIsoModalToolChange } =
    useWorkspaceTools(isoOrnateRef);

  useEffect(() => {
    (async () => {
      setPdfDocuments(
        await Promise.all([
          ...documents
            .filter(({ type }) => type === DocumentType.PID)
            .map(async (document, index) => ({
              id: getKonvaSelectorSlugByExternalId(document.externalId),
              url: await getDocumentUrlByExternalId(client)(
                document.pdfExternalId
              ),
              pageNumber: 1,
              row: 1,
              column: index + 1,
              type: document.type,
              name: withoutFileExtension(document.pdfExternalId),
            })),
          ...documents
            .filter(({ type }) => type === DocumentType.ISO)
            .map(async (document, index) => ({
              id: getKonvaSelectorSlugByExternalId(document.externalId),
              url: await getDocumentUrlByExternalId(client)(
                document.pdfExternalId
              ),
              pageNumber: 1,
              row: 2,
              column: index + 2,
              type: document.type,
              name: withoutFileExtension(document.pdfExternalId),
            })),
        ])
      );

      setIsInitialized(true);
    })();
  }, []);

  if (!isInitialized || !documents || !pdfDocuments) {
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

  const onAnnotationClick = (
    { evt }: KonvaEventObject<MouseEvent>,
    annotationId: string
  ): void => {
    if (tool === WorkspaceTool.LINK) {
      const link =
        getLinkByAnnotationId(documents, annotationId) ??
        getLinkByAnnotationId(documents, annotationId, true);
      if (!link) {
        console.warn(`No link found for ${annotationId}`);
        return;
      }

      const isLinkedAnnotationInIso =
        getDocumentByExternalId(documents, link.to.documentId).type ===
        DocumentType.ISO;
      if (isLinkedAnnotationInIso && !isIsoModalOpen) {
        setIsIsoModalOpen(true);
      }

      centerOnAnnotationByAnnotationId(
        documents,
        isLinkedAnnotationInIso ? isoOrnateRef : ornateRef,
        link.to.annotationId
      );

      return;
    }

    if (tool !== WorkspaceTool.SELECT) {
      return;
    }

    const foundDiscrepancy = discrepancies.find((discrepancy) =>
      discrepancy.ids.includes(annotationId)
    );

    if (foundDiscrepancy) {
      setPendingDiscrepancy(foundDiscrepancy);
      setDiscrepancyModalState((prevState) => ({ ...prevState, isOpen: true }));
      return;
    }

    if (evt.shiftKey) {
      toggleAnnotationSelection(annotationId);
      return;
    }

    const usedAnnotationIds =
      selectedAnnotationIds.length > 0 &&
      selectedAnnotationIds.includes(annotationId)
        ? selectedAnnotationIds
        : [annotationId];

    setSelectedAnnotationIds(usedAnnotationIds);
    setPendingDiscrepancy({
      id: usedAnnotationIds.join('-'),
      ids: usedAnnotationIds,
      comment: '',
      createdAt: new Date(),
    });
    setDiscrepancyModalState({
      isOpen: true,
      position: {
        x: evt.clientX + DISCREPANCY_MODAL_OFFSET_X,
        y: evt.clientY + DISCREPANCY_MODAL_OFFSET_Y,
      },
    });
  };

  const onDeletePendingDiscrepancy = () => {
    setSelectedAnnotationIds([]);
    setDiscrepancyModalState((prevState) => ({ ...prevState, isOpen: false }));
    if (!pendingDiscrepancy) {
      return;
    }
    onDiscrepancyChange(
      discrepancies.filter(({ id }) => id !== pendingDiscrepancy.id)
    );
  };

  const onSaveDiscrepancy = (discrepancy: Discrepancy) => {
    // TODOO: Maintain order if changes.
    onDiscrepancyChange([
      ...discrepancies.filter((d) => d.id !== discrepancy.id),
      discrepancy,
    ]);
    setSelectedAnnotationIds([]);
    setDiscrepancyModalState((prevState) => ({ ...prevState, isOpen: false }));
  };

  const getDrawingsByDocumentId = (
    documents: ParsedDocument[],
    documentId: string
  ) => {
    const document = documents.find(
      (document) => document.externalId === documentId
    );

    if (document === undefined) {
      console.warn("Document didn't exist");
      return [];
    }

    return [
      ...getAnnotationOverlay(
        lineReview.id,
        document,
        selectedAnnotationIds,
        'current-selection-',
        {
          stroke: 'lightblue',
          strokeWidth: 3,
          dash: [3, 3],
        }
      ),
      ...discrepancies.flatMap((discrepancy) =>
        getAnnotationOverlay(
          lineReview.id,
          document,
          discrepancy.ids,
          `discrepancy-${discrepancy.id}`,
          {
            stroke: 'rgba(207,26,23, 0.6)',
            strokeWidth: 3,
            dash: [3, 3],
          }
        )
      ),
      ...(tool === WorkspaceTool.LINK
        ? [
            ...getAnnotationOverlay(
              lineReview.id,
              document,
              document.linking.map(
                ({ from: { annotationId } }) => annotationId
              ),
              'navigatable',
              {
                stroke: '#39A263',
                strokeWidth: 3,
                dash: [3, 3],
              }
            ),
            ...getAnnotationOverlay(
              lineReview.id,
              document,
              document.linking.map(({ to: { annotationId } }) => annotationId),
              'navigatable-target-',
              {
                stroke: '#39A263',
                strokeWidth: 3,
                dash: [3, 3],
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
          strokeWidth: 3,
        },
        [WorkspaceTool.SELECT, WorkspaceTool.LINK].includes(tool)
          ? onAnnotationClick
          : undefined
      ),
      ...getDiscrepancyCircleMarkersForDocument(
        lineReview.id,
        document,
        discrepancies,
        tool === WorkspaceTool.SELECT
          ? (discrepancy) => {
              setPendingDiscrepancy(discrepancy);
              setDiscrepancyModalState((prevState) => ({
                ...prevState,
                isOpen: true,
              }));
            }
          : undefined
      ),
    ];
  };

  const drawings = [
    ...documents
      .filter(({ type }) => type === DocumentType.PID)
      .flatMap((document) =>
        getDrawingsByDocumentId(documents, document.externalId)
      ),
    ...documents
      .filter(({ type }) => type === DocumentType.ISO)
      .flatMap((document) =>
        // For ISO
        getDiscrepancyCircleMarkersForDocument(
          lineReview.id,
          document,
          discrepancies.map((discrepancy) => ({
            ...discrepancy,
            ids: discrepancy.ids
              .map((id) =>
                mapPidAnnotationIdToIsoAnnotationId(
                  documents.filter(({ type }) => type === DocumentType.PID),
                  id
                )
              )
              .filter(isNotUndefined),
          })),
          tool === WorkspaceTool.SELECT
            ? (discrepancy) => {
                setPendingDiscrepancy(discrepancy);
                setDiscrepancyModalState((prevState) => ({
                  ...prevState,
                  isOpen: true,
                }));
              }
            : undefined
        )
      ),
  ];

  const groups = ornateRef
    ? getFileConnectionGroups({
        ornateViewer: ornateRef,
        connections: getFileConnections(
          lineReview.id,
          documents,
          DocumentType.PID,
          DocumentType.PID
        ),
        columnGap: SLIDE_COLUMN_GAP,
        rowGap: SLIDE_ROW_GAP,
        onSelect: (id: string) =>
          selectedFileConnectionId === id
            ? setSelectedFileConnectionId(undefined)
            : setSelectedFileConnectionId(id),
        selectedId: selectedFileConnectionId,
      })
    : [];

  return (
    <>
      {discrepancyModalState.isOpen && pendingDiscrepancy && (
        <DiscrepancyModal
          // This is a hack
          key={pendingDiscrepancy.ids.join('-')}
          initialPosition={discrepancyModalState.position}
          initialDiscrepancy={pendingDiscrepancy}
          onDeletePress={onDeletePendingDiscrepancy}
          onSave={onSaveDiscrepancy}
        />
      )}

      <IsoModal
        lineReview={lineReview}
        documents={documents.filter(({ type }) => type === DocumentType.ISO)}
        discrepancies={discrepancies.map((discrepancy) => ({
          ...discrepancy,
          ids: discrepancy.ids
            .map((id) => mapPidAnnotationIdToIsoAnnotationId(documents, id))
            .filter(isNotUndefined),
        }))}
        visible={isIsoModalOpen}
        onOrnateRef={setIsoOrnateRef}
        onHidePress={() => setIsIsoModalOpen(false)}
        tool={isoModalTool}
        onToolChange={onIsoModalToolChange}
      />
      <div style={{ height: 'calc(100vh - 125px)', position: 'relative' }}>
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

        <div
          style={{
            position: 'absolute',
            left: 16,
            top: 16,
            width: 170,
            zIndex: layers.OVERLAY - 1,
            backgroundColor: 'white',
          }}
        >
          <DocumentJumper
            options={documentJumperOptions}
            onChange={(value) => setJumpToDocumentValue(value)}
            value={jumpToDocumentValue}
          />
        </div>

        <ReactOrnate
          documents={pdfDocuments}
          nodes={[
            ...documents
              .filter((document) => document.type === DocumentType.PID)
              .map((document) =>
                getOpacityGroupByDocument(lineReview.id, document)
              ),
            ...groups,
            ...drawings,
          ]}
          onOrnateRef={(ref) => {
            setOrnateRef(ref);
            onOrnateRef(ref);
          }}
          renderWorkspaceTools={(ornate, isFocused) => (
            <WorkSpaceTools
              tool={tool}
              onToolChange={onToolChange}
              ornateRef={ornate}
              enabledTools={[
                WorkspaceTool.LAYERS,
                WorkspaceTool.SELECT,
                WorkspaceTool.MOVE,
                WorkspaceTool.LINK,
              ]}
              areKeyboardShortcutsEnabled={isFocused}
            />
          )}
        />
      </div>
    </>
  );
};

export default LineReviewViewer;
