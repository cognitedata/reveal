import { Button } from '@cognite/cogs.js';
import { CogniteOrnate } from '@cognite/ornate';
import type { CogniteClient } from '@cognite/sdk';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import keyBy from 'lodash/keyBy';
import {
  DocumentType,
  LineReview,
  ParsedDocument,
  TextAnnotation,
} from 'modules/lineReviews/types';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import styled from 'styled-components';
import layers from 'utils/z';

import usePrevious from '../../hooks/usePrevious';
import { getDocumentUrlByExternalId } from '../../modules/lineReviews/api';
import { DiscrepancyModalState } from '../../pages/LineReview';
import getFileConnectionGroups from '../../utils/getFileConnectionDrawings';
import WorkSpaceTools from '../WorkSpaceTools';

import centerOnAnnotationByAnnotationId from './centerOnIsoAnnotationByPidAnnotation';
import { BOUNDING_BOX_PADDING_PX } from './constants';
import DiscrepancyModal from './DiscrepancyModal';
import DiscrepancyTool from './DiscrepancyTool';
import DocumentJumper from './DocumentJumper';
import getAnnotationBoundingBoxOverlay from './getAnnotationBoundingBoxOverlay';
import getDiscrepancyCircleMarkers from './getDiscrepancyCircleMarkers';
import getDocumentByExternalId from './getDocumentByExternalId';
import getFileConnections from './getFileConnections';
import getKonvaSelectorSlugByExternalId from './getKonvaSelectorSlugByExternalId';
import getLinksByAnnotationId from './getLinksByAnnotationId';
import IsoModal from './IsoModal';
import ReactOrnate, {
  ReactOrnateProps,
  SLIDE_COLUMN_GAP,
  SLIDE_ROW_GAP,
} from './ReactOrnate';
import useDocumentJumper from './useDocumentJumper';
import useWorkspaceTools, { WorkspaceTool } from './useWorkspaceTools';
import withoutFileExtension from './withoutFileExtension';

type LineReviewViewerProps = {
  client: CogniteClient;
  lineReview: LineReview;
  documents: ParsedDocument[];
  discrepancies: Discrepancy[];
  onDiscrepancyChange: (
    transform: (discrepancies: Discrepancy[]) => Discrepancy[]
  ) => void;
  textAnnotations: TextAnnotation[];
  onTextAnnotationChange: (
    transform: (textAnnotations: TextAnnotation[]) => TextAnnotation[]
  ) => void;
  onOrnateRef: (ref: CogniteOrnate | undefined) => void;
  onOpenSidePanelButtonPress: () => void;
  onDeleteDiscrepancy: (id: string) => void;
  discrepancyModalState: DiscrepancyModalState;
  setDiscrepancyModalState: Dispatch<SetStateAction<DiscrepancyModalState>>;
  onDiscrepancyInteraction: (id: string) => void;
};

const DocumentJumperContainer = styled.div`
  position: absolute;
  left: 16px;
  top: 16px;
  width: 170px;
  z-index: ${layers.OVERLAY - 1};
  background-color: white;
`;

export type Discrepancy = {
  id: string;
  comment: string;
  createdAt: Date;
  status: 'pending' | 'approved';
  targetExternalId: string;
  boundingBox?: {
    width: number;
    height: number;
    y: number;
    x: number;
  };
};

const useLoadLineReviewStateOnMount = (
  ornateRef: CogniteOrnate | undefined,
  discrepancies: Discrepancy[],
  onDiscrepancyInteraction: (id: string) => void,
  textAnnotations: TextAnnotation[]
) => {
  useEffect(() => {
    if (ornateRef) {
      discrepancies.forEach((discrepancy) => {
        const { boundingBox } = discrepancy;
        if (boundingBox === undefined) {
          console.log('discrepancy.boundingBox is undefined', discrepancy);
          return;
        }

        const discrepancyNode = DiscrepancyTool.getDiscrepancyNode({
          id: discrepancy.id,
          groupId: getKonvaSelectorSlugByExternalId(
            discrepancy.targetExternalId
          ),
          ...boundingBox,
          status: discrepancy.status,
        });

        discrepancyNode.on('click', () =>
          onDiscrepancyInteraction(discrepancy.id)
        );

        const groupNode = ornateRef.stage.findOne(
          `#${getKonvaSelectorSlugByExternalId(discrepancy.targetExternalId)}`
        ) as Konva.Group;

        groupNode.add(discrepancyNode);
      });

      textAnnotations.forEach((textAnnotation) => {
        const { boundingBox } = textAnnotation;
        if (boundingBox === undefined) {
          return;
        }

        const textAnnotationNode = new Konva.Text({
          ...boundingBox,
          id: textAnnotation.id,
          fill: textAnnotation.fill,
          fontSize: textAnnotation.fontSize,
          text: textAnnotation.text,
          draggable: true,
          type: 'text',
        });

        const groupNode = ornateRef.stage.findOne(
          `#${getKonvaSelectorSlugByExternalId(
            textAnnotation.targetExternalId
          )}`
        ) as Konva.Group;

        groupNode.add(textAnnotationNode);
      });
    }
  }, [ornateRef]);
};

const useShamefulKeepReactAndOrnateInSync = (
  ornateRef: CogniteOrnate | undefined,
  discrepancies: Discrepancy[],
  textAnnotations: TextAnnotation[],
  onDiscrepancyInteraction: (id: string) => void
) => {
  const previousDiscrepancies = usePrevious(discrepancies);

  useLoadLineReviewStateOnMount(
    ornateRef,
    discrepancies,
    onDiscrepancyInteraction,
    textAnnotations
  );

  useEffect(() => {
    discrepancies.forEach((d) => {
      const node = ornateRef?.stage.findOne(`#${d.id}`) as Konva.Rect;
      node?.on('click', () => {
        onDiscrepancyInteraction(d.id);
      });
    });

    return () => {
      discrepancies.forEach(({ id }) => {
        const node = ornateRef?.stage.findOne(`#${id}`) as Konva.Rect;
        node?.off('click');
      });
    };
  }, [discrepancies]);

  useEffect(() => {
    // DELETIONS
    if (previousDiscrepancies) {
      const discrepancyIds = discrepancies.map((d) => d.id);
      const previousDiscrepanciesIds = previousDiscrepancies.map((d) => d.id);
      const discrepancyIdsToRemove = previousDiscrepanciesIds.filter(
        (id) => !discrepancyIds.includes(id)
      );
      discrepancyIdsToRemove.forEach((id) => {
        const node = ornateRef?.stage.findOne(`#${id}`) as Konva.Rect;
        ornateRef?.transformer?.setSelectedNodes([]);
        node?.remove();
      });
    }
  }, [discrepancies, previousDiscrepancies, ornateRef]);

  useEffect(() => {
    // STATE TRANSITIONS
    discrepancies
      .filter((discrepancy) => discrepancy.status === 'approved')
      .filter(
        (discrepancy) =>
          previousDiscrepancies?.find(
            (prevDiscrepancy) => prevDiscrepancy.id === discrepancy.id
          )?.status === 'pending'
      )
      .forEach((discrepancy) => {
        const node = ornateRef?.stage.findOne(
          `#${discrepancy.id}`
        ) as Konva.Rect;
        node.fill('rgba(213, 26, 70, 0.15)');
        node.stroke('#D51A46');
      });
  }, [discrepancies, previousDiscrepancies, ornateRef]);
};

const LineReviewViewer: React.FC<LineReviewViewerProps> = ({
  client,
  discrepancies,
  documents,
  onDiscrepancyChange,
  lineReview,
  onOrnateRef,
  textAnnotations,
  onOpenSidePanelButtonPress,
  onDeleteDiscrepancy,
  discrepancyModalState,
  setDiscrepancyModalState,
  onDiscrepancyInteraction,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [pdfDocuments, setPdfDocuments] = useState<
    ReactOrnateProps['documents'] | undefined
  >(undefined);
  const [isIsoModalOpen, setIsIsoModalOpen] = useState(false);
  const [isoOrnateRef, setIsoOrnateRef] = useState<CogniteOrnate | undefined>(
    undefined
  );
  const [pendingDiscrepancyId, setPendingDiscrepancyId] = useState<
    string | undefined
  >(undefined);
  const [ornateRef, setOrnateRef] = useState<CogniteOrnate | undefined>(
    undefined
  );
  const { documentJumperOptions, jumpToDocumentValue, setJumpToDocumentValue } =
    useDocumentJumper(documents, ornateRef);
  const [selectedFileConnectionId, setSelectedFileConnectionId] = useState<
    string | undefined
  >(undefined);

  useShamefulKeepReactAndOrnateInSync(
    ornateRef,
    discrepancies,
    textAnnotations,
    onDiscrepancyInteraction
  );

  const { tool, onToolChange } = useWorkspaceTools(ornateRef, {
    onDiscrepancyCreate: (id: string, targetExternalId: string) => {
      onDiscrepancyChange((prevDiscrepancies) => [
        ...prevDiscrepancies.filter(({ status }) => status === 'approved'),
        {
          id,
          comment: '',
          createdAt: new Date(),
          status: 'pending',
          targetExternalId,
        },
      ]);

      setPendingDiscrepancyId(id);
    },
  });

  useEffect(() => {
    if (pendingDiscrepancyId) {
      onDiscrepancyInteraction(pendingDiscrepancyId);
      setPendingDiscrepancyId(undefined);
    }
  }, [pendingDiscrepancyId]);

  const onSaveDiscrepancy = (discrepancy: Discrepancy) => {
    const foundIndex = discrepancies.findIndex((d) => d.id === discrepancy.id);
    onDiscrepancyChange((discrepancies) =>
      foundIndex === -1
        ? [
            ...discrepancies,
            {
              ...discrepancy,
              status: 'approved',
            },
          ]
        : [
            ...discrepancies.slice(0, foundIndex),
            {
              ...discrepancy,
              status: 'approved',
            },
            ...discrepancies.slice(foundIndex + 1),
          ]
    );

    setDiscrepancyModalState((prevState) => ({ ...prevState, isOpen: false }));
  };

  const { tool: isoModalTool, onToolChange: onIsoModalToolChange } =
    useWorkspaceTools(isoOrnateRef);

  useEffect(() => {
    if (client !== undefined) {
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
                externalId: document.externalId,
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
                column: index + 1,
                type: document.type,
                name: withoutFileExtension(document.pdfExternalId),
                externalId: document.externalId,
              })),
          ])
        );

        setIsInitialized(true);
      })();
    }
  }, [client]);

  if (!isInitialized || !documents || !pdfDocuments) {
    return null;
  }

  const onLinkClick = (
    event: KonvaEventObject<MouseEvent>,
    annotationId: string
  ) => {
    const links = [
      ...getLinksByAnnotationId(documents, annotationId),
      ...getLinksByAnnotationId(documents, annotationId, true),
    ];
    if (links.length === 0) {
      console.warn(`No link found for ${annotationId}`);
      return;
    }

    const link = links[0];
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
  };

  const documentsByExternalId = keyBy(
    documents,
    (document) => document.externalId
  );

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
      ...[
        ...getAnnotationBoundingBoxOverlay(
          undefined,
          document,
          document.linking
            .filter(
              ({ from, to }) =>
                documentsByExternalId[from.documentId] !== undefined &&
                documentsByExternalId[to.documentId] !== undefined &&
                documentsByExternalId[from.documentId].type === DocumentType.PID
            )
            .flatMap(({ from, to }) => [from.annotationId, to.annotationId]),
          '',
          {
            fill: 'rgba(24, 175, 142, 0.2)',
            stroke: '#00665C',
            strokeWidth: 3,
            dash: [3, 3],
            padding: BOUNDING_BOX_PADDING_PX,
          },
          tool === WorkspaceTool.DEFAULT ? onLinkClick : undefined
        ),
        ...getAnnotationBoundingBoxOverlay(
          undefined,
          document,
          document.annotations
            .filter(
              (annotation) =>
                annotation.type === 'text' &&
                annotation.text?.includes(lineReview.id)
            )
            .map((annotation) => annotation.id),
          'line-number-bounding-box-',
          {
            fill: 'rgba(74, 103, 251, 0.2)',
            padding: 3,
          }
        ),
      ],
    ];
  };

  const groups = ornateRef
    ? getFileConnectionGroups({
        ornateViewer: ornateRef,
        connections: getFileConnections(
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

  const overlays = documents
    .filter(({ type }) => type === DocumentType.PID)
    .flatMap((document) =>
      getDrawingsByDocumentId(documents, document.externalId)
    );

  const nodes = [
    ...groups,
    ...overlays,
    ...getDiscrepancyCircleMarkers(
      lineReview.id,
      discrepancies,
      ornateRef,
      (evt, discrepancy) => onDiscrepancyInteraction(discrepancy.id)
    ),
  ];

  const onOpenIsoButtonPress = () => setIsIsoModalOpen(true);

  return (
    <>
      {discrepancyModalState.isOpen && discrepancyModalState.discrepancy && (
        <DiscrepancyModal
          // This is a hack
          key={discrepancyModalState.discrepancy.id}
          initialPosition={discrepancyModalState.position}
          initialDiscrepancy={discrepancyModalState.discrepancy}
          onDeletePress={onDeleteDiscrepancy}
          onSave={onSaveDiscrepancy}
        />
      )}

      <IsoModal
        lineReview={lineReview}
        documents={documents}
        isoDocuments={documents.filter(({ type }) => type === DocumentType.ISO)}
        visible={isIsoModalOpen}
        onOrnateRef={setIsoOrnateRef}
        onHidePress={() => setIsIsoModalOpen(false)}
        tool={isoModalTool}
        onToolChange={onIsoModalToolChange}
        ornateRef={ornateRef}
      />
      <div style={{ height: 'calc(100vh - 125px)', position: 'relative' }}>
        {!isIsoModalOpen && (
          <div
            style={{
              position: 'absolute',
              right: 60,
              top: 20,
              zIndex: layers.OVERLAY - 2,
            }}
          >
            <Button onClick={onOpenIsoButtonPress}>Open ISO</Button>
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            right: 20,
            top: 20,
            zIndex: layers.OVERLAY - 2,
          }}
        >
          <Button onClick={onOpenSidePanelButtonPress} icon="PanelLeft" />
        </div>

        <DocumentJumperContainer>
          <DocumentJumper
            options={documentJumperOptions}
            onChange={(value) => setJumpToDocumentValue(value)}
            value={jumpToDocumentValue}
          />
        </DocumentJumperContainer>

        <ReactOrnate
          documents={pdfDocuments}
          nodes={nodes}
          onOrnateRef={(ref) => {
            setOrnateRef(ref);
            onOrnateRef(ref);
          }}
          renderWorkspaceTools={(ornate, isFocused) => (
            <WorkSpaceTools
              tool={tool}
              onToolChange={onToolChange}
              enabledTools={[
                WorkspaceTool.DEFAULT,
                WorkspaceTool.RECTANGLE,
                WorkspaceTool.TEXT,
                WorkspaceTool.MOVE,
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
