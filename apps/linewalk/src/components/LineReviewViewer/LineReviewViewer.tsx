import { Button, Icon } from '@cognite/cogs.js';
import { CogniteOrnate } from '@cognite/ornate';
import { useAuthContext } from '@cognite/react-container';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import keyBy from 'lodash/keyBy';
import {
  DocumentType,
  LineReview,
  ParsedDocument,
  TextAnnotation,
  WorkspaceDocument,
} from 'modules/lineReviews/types';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import layers from 'utils/z';

import usePrevious from '../../hooks/usePrevious';
import { removeDocumentLabel } from '../../modules/lineReviews/api';
import { DiscrepancyModalState } from '../../pages/LineReview';
import getFileConnectionGroups from '../../utils/getFileConnectionDrawings';
import WorkSpaceTools from '../WorkSpaceTools';

import centerOnAnnotationByAnnotationId from './centerOnAnnotationByAnnotationId';
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
import ReactOrnate, { SLIDE_COLUMN_GAP, SLIDE_ROW_GAP } from './ReactOrnate';
import useDocumentJumper from './useDocumentJumper';
import useParsedDocuments from './useParsedDocuments';
import useWorkspaceTools, { WorkspaceTool } from './useWorkspaceTools';
import withoutFileExtension from './withoutFileExtension';

type LineReviewViewerProps = {
  lineReview: LineReview;
  documents: WorkspaceDocument[];
  setDocuments: (
    transform: (previousDocuments: WorkspaceDocument[]) => WorkspaceDocument[]
  ) => void;
  discrepancies: Discrepancy[];
  onDiscrepancyChange: (
    transform: (discrepancies: Discrepancy[]) => Discrepancy[]
  ) => void;
  textAnnotations: TextAnnotation[];
  onTextAnnotationChange: (
    transform: (textAnnotations: TextAnnotation[]) => TextAnnotation[]
  ) => void;
  onOrnateRef: (ref: CogniteOrnate | undefined) => void;
  isSidePanelOpen: boolean;
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
  width: 300px;
  z-index: ${layers.LINE_REVIEW_VIEWER_BUTTONS};
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
  isSidePanelOpen,
  setDocuments,
}) => {
  const { client } = useAuthContext();
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
  const {
    documentJumperOptions,
    jumpToDocumentValue,
    setJumpToDocumentValue,
    inputValue,
    onInputChange,
  } = useDocumentJumper(lineReview.id, documents, ornateRef, (document) =>
    setDocuments((prevDocuments) => [...prevDocuments, document])
  );
  const [selectedFileConnectionId, setSelectedFileConnectionId] = useState<
    string | undefined
  >(undefined);
  const { isLoading, parsedDocuments } = useParsedDocuments(documents);

  const pdfDocuments = useMemo(
    () => [
      ...documents
        .filter(({ type }) => type === DocumentType.PID)
        .map((document, index) => ({
          id: getKonvaSelectorSlugByExternalId(document.pdfExternalId),
          pageNumber: 1,
          row: 1,
          column: index + 1,
          type: document.type,
          name: withoutFileExtension(document.pdfExternalId),
          pdfExternalId: document.pdfExternalId,
          pdf: document.pdf,
        })),
      ...documents
        .filter(({ type }) => type === DocumentType.ISO)
        .map((document, index) => ({
          id: getKonvaSelectorSlugByExternalId(document.pdfExternalId),
          pageNumber: 1,
          row: 2,
          column: index + 1,
          type: document.type,
          name: withoutFileExtension(document.pdfExternalId),
          pdfExternalId: document.pdfExternalId,
          pdf: document.pdf,
        })),
    ],
    [documents]
  );

  const isoDocuments = useMemo(
    () => documents.filter(({ type }) => type === DocumentType.ISO),
    [documents]
  );

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

  const onDiscrepancyModalClosePress = () => {
    setDiscrepancyModalState((prevState) => {
      if (prevState.discrepancy?.status === 'pending') {
        onDeleteDiscrepancy(prevState.discrepancy.id);
      }

      return { ...prevState, isOpen: false };
    });
  };

  const { tool: isoModalTool, onToolChange: onIsoModalToolChange } =
    useWorkspaceTools(isoOrnateRef);

  const groups = useMemo(() => {
    if (!ornateRef) {
      return [];
    }

    if (!parsedDocuments) {
      return [];
    }

    if (isLoading) {
      return [];
    }

    return getFileConnectionGroups({
      ornateViewer: ornateRef,
      connections: getFileConnections(
        parsedDocuments,
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
    });
  }, [ornateRef, parsedDocuments, isLoading]);

  if (!documents) {
    return null;
  }

  const onLinkClick = (
    event: KonvaEventObject<MouseEvent>,
    annotationId: string
  ) => {
    const links = [
      ...getLinksByAnnotationId(parsedDocuments, annotationId),
      ...getLinksByAnnotationId(parsedDocuments, annotationId, true),
    ];
    if (links.length === 0) {
      console.warn(`No link found for ${annotationId}`);
      return;
    }

    const link = links[0];
    const isLinkedAnnotationInIso =
      getDocumentByExternalId(parsedDocuments, link.to.documentId).type ===
      DocumentType.ISO;
    if (isLinkedAnnotationInIso && !isIsoModalOpen) {
      setIsIsoModalOpen(true);
    }

    centerOnAnnotationByAnnotationId(
      parsedDocuments,
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

  const overlays = documents
    .filter(({ type }) => type === DocumentType.PID)
    .flatMap((document) =>
      getDrawingsByDocumentId(parsedDocuments, document.externalId)
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

  const onRemovePress = (pdfExternalId: string) => {
    setDocuments((prevDocuments) =>
      prevDocuments.filter(
        (document) => document.pdfExternalId !== pdfExternalId
      )
    );

    if (client) {
      removeDocumentLabel(client, pdfExternalId, lineReview.id);
    }
  };

  return (
    <>
      {discrepancyModalState.isOpen && discrepancyModalState.discrepancy && (
        <DiscrepancyModal
          // This is a hack
          documents={documents}
          key={discrepancyModalState.discrepancy.id}
          initialPosition={discrepancyModalState.position}
          initialDiscrepancy={discrepancyModalState.discrepancy}
          onDeletePress={() =>
            onDeleteDiscrepancy(discrepancyModalState.discrepancy!.id)
          }
          onSave={onSaveDiscrepancy}
          onClosePress={onDiscrepancyModalClosePress}
        />
      )}

      <IsoModal
        lineReview={lineReview}
        parsedDocuments={parsedDocuments}
        isoDocuments={isoDocuments}
        visible={isIsoModalOpen}
        onOrnateRef={setIsoOrnateRef}
        onHidePress={() => setIsIsoModalOpen(false)}
        tool={isoModalTool}
        onToolChange={onIsoModalToolChange}
        ornateRef={ornateRef}
      />
      <div style={{ height: 'calc(100vh - 125px)', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            right: 18,
            top: 20,
            zIndex: layers.LINE_REVIEW_VIEWER_BUTTONS,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}
        >
          {isLoading && (
            <div style={{ display: 'flex', alignSelf: 'center' }}>
              <Icon type="Loader" />
            </div>
          )}

          {!isIsoModalOpen && (
            <div
              style={{
                marginLeft: 20,
              }}
            >
              <Button onClick={onOpenIsoButtonPress}>Open ISO</Button>
            </div>
          )}

          {!isSidePanelOpen && (
            <div
              style={{
                marginLeft: 20,
              }}
            >
              <Button onClick={onOpenSidePanelButtonPress} icon="PanelLeft" />
            </div>
          )}
        </div>

        <DocumentJumperContainer>
          <DocumentJumper
            options={documentJumperOptions}
            onChange={(value) => value && setJumpToDocumentValue(value)}
            value={jumpToDocumentValue}
            inputValue={inputValue}
            onInputChange={onInputChange}
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
          onRemovePress={onRemovePress}
        />
      </div>
    </>
  );
};

export default LineReviewViewer;
