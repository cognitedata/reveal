import { Button, Icon } from '@cognite/cogs.js';
import { CogniteOrnate } from '@cognite/ornate';
import { useAuthContext } from '@cognite/react-container';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import keyBy from 'lodash/keyBy';
import { DiagramType } from '@cognite/pid-tools';
import {
  LineReview,
  ParsedDocument,
  TextAnnotation,
  WorkspaceDocument,
} from 'modules/lineReviews/types';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styled from 'styled-components';
import layers from 'utils/z';
import { v4 as uuid } from 'uuid';

import usePrevious from '../../hooks/usePrevious';
import { removeLineNumberFromDocumentMetadata } from '../../modules/lineReviews/api';
import {
  DISCREPANCY_MODAL_OFFSET_X,
  DISCREPANCY_MODAL_OFFSET_Y,
  DiscrepancyModalState,
} from '../../pages/LineReview';
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
import { DiscrepancyInteractionHandler } from './types';
import useDocumentJumper from './useDocumentJumper';
import useForceUpdate from './useForceUpdate';
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
  onOrnateRef: (ref: CogniteOrnate | undefined) => void;
  isSidePanelOpen: boolean;
  onOpenSidePanelButtonPress: () => void;
  onDeleteDiscrepancy: (id: string) => void;
  discrepancyModalState: DiscrepancyModalState;
  setDiscrepancyModalState: Dispatch<SetStateAction<DiscrepancyModalState>>;
  onDiscrepancyInteraction: DiscrepancyInteractionHandler;
};

const DocumentJumperContainer = styled.div`
  position: absolute;
  left: 16px;
  top: 16px;
  width: 300px;
  z-index: ${layers.LINE_REVIEW_VIEWER_BUTTONS};
  background-color: white;
`;

export type DiscrepancyAnnotation = {
  nodeId: string;
  targetExternalId: string;
  boundingBox?: {
    width: number;
    height: number;
    y: number;
    x: number;
  };
};

export type Discrepancy = {
  id: string;
  comment: string;
  createdAt: Date;
  status: 'pending' | 'approved';
  annotations: DiscrepancyAnnotation[];
};

const useLoadLineReviewStateOnMount = (
  ornateRef: CogniteOrnate | undefined,
  discrepancies: Discrepancy[],
  onDiscrepancyInteraction: DiscrepancyInteractionHandler,
  textAnnotations: TextAnnotation[]
) => {
  useEffect(() => {
    if (ornateRef) {
      discrepancies.forEach((discrepancy) => {
        discrepancy.annotations.forEach((annotation) => {
          const { boundingBox } = annotation;
          if (boundingBox === undefined) {
            console.log('discrepancy.boundingBox is undefined', discrepancy);
            return;
          }

          const discrepancyNode = DiscrepancyTool.getDiscrepancyNode({
            id: annotation.nodeId,
            groupId: getKonvaSelectorSlugByExternalId(
              annotation.targetExternalId
            ),
            ...boundingBox,
            status: discrepancy.status,
          });

          discrepancyNode.on('click', () =>
            onDiscrepancyInteraction(ornateRef, annotation.nodeId)
          );

          const groupNode = ornateRef.stage.findOne(
            `#${getKonvaSelectorSlugByExternalId(annotation.targetExternalId)}`
          ) as Konva.Group;

          if (groupNode === undefined) {
            // The document might not exist in the current workspace.
            return;
          }

          groupNode.add(discrepancyNode);
        });
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

        if (groupNode === undefined) {
          // The document might not exist in the current workspace.
          return;
        }

        groupNode.add(textAnnotationNode);
      });
    }
  }, [ornateRef]);
};

export const useShamefulKeepReactAndOrnateInSync = (
  ornateRef: CogniteOrnate | undefined,
  discrepancies: Discrepancy[],
  textAnnotations: TextAnnotation[],
  onDiscrepancyInteraction: DiscrepancyInteractionHandler
) => {
  const previousDiscrepancies = usePrevious(discrepancies);

  useLoadLineReviewStateOnMount(
    ornateRef,
    discrepancies,
    onDiscrepancyInteraction,
    textAnnotations
  );

  useEffect(() => {
    const discrepancyAnnotationNodeIds = discrepancies.flatMap((discrepancy) =>
      discrepancy.annotations.map((annotation) => annotation.nodeId)
    );

    const previousDiscrepancyAnnotationNodeIds = previousDiscrepancies?.flatMap(
      (discrepancy) =>
        discrepancy.annotations.map((annotation) => annotation.nodeId)
    );

    // DELETIONS
    const discrepancyAnnotationNodeIdsToRemove =
      previousDiscrepancyAnnotationNodeIds?.filter(
        (nodeId) => !discrepancyAnnotationNodeIds.includes(nodeId)
      ) ?? [];

    discrepancyAnnotationNodeIdsToRemove.forEach((nodeId) => {
      ornateRef?.stage.findOne(`#${nodeId}`)?.remove();
    });
  }, [discrepancies]);

  useEffect(() => {
    discrepancies.forEach((discrepancy) => {
      discrepancy.annotations.forEach((annotation) => {
        const node = ornateRef?.stage.findOne(
          `#${annotation.nodeId}`
        ) as Konva.Rect;
        node?.on('click', () => {
          onDiscrepancyInteraction(ornateRef, annotation.nodeId);
        });
      });
    });

    return () => {
      discrepancies.forEach((discrepancy) => {
        discrepancy.annotations.forEach((annotation) => {
          const node = ornateRef?.stage.findOne(
            `#${annotation.nodeId}`
          ) as Konva.Rect;
          node?.off('click');
        });
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
        const foundDiscrepancy = previousDiscrepancies.find(
          (discrepancy) => discrepancy.id === id
        );

        if (!foundDiscrepancy) {
          return;
        }

        foundDiscrepancy.annotations.forEach((annotation) => {
          const node = ornateRef?.stage.findOne(
            `#${annotation.nodeId}`
          ) as Konva.Rect;
          ornateRef?.transformer?.setSelectedNodes([]);
          node?.remove();
        });
      });
    }
  }, [discrepancies, previousDiscrepancies, ornateRef]);

  useEffect(() => {
    // STATE TRANSITIONS
    discrepancies
      .filter((discrepancy) => discrepancy.status === 'approved')
      .forEach((discrepancy) => {
        discrepancy.annotations.forEach((annotation) => {
          const node = ornateRef?.stage.findOne(
            `#${annotation.nodeId}`
          ) as Konva.Rect;

          if (node === undefined) {
            return;
          }

          node.fill('rgba(213, 26, 70, 0.15)');
          node.stroke('#D51A46');
        });
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
  const forceUpdate = useForceUpdate();
  const { client } = useAuthContext();
  const [isIsoModalOpen, setIsIsoModalOpen] = useState(false);
  const [isoOrnateRef, setIsoOrnateRef] = useState<CogniteOrnate | undefined>(
    undefined
  );
  const [ornateRef, setOrnateRef] = useState<CogniteOrnate | undefined>(
    undefined
  );
  const {
    documentJumperOptions,
    jumpToDocumentValue,
    setJumpToDocumentValue,
    inputValue,
    onInputChange,
  } = useDocumentJumper(
    lineReview.id,
    lineReview.unit,
    documents,
    ornateRef,
    (document) => setDocuments((prevDocuments) => [...prevDocuments, document])
  );
  const [selectedFileConnectionId, setSelectedFileConnectionId] = useState<
    string | undefined
  >(undefined);
  const { isLoading, parsedDocuments } = useParsedDocuments(documents);

  const pdfDocuments = useMemo(
    () => [
      ...documents
        .filter(({ type }) => type === DiagramType.PID)
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
        .filter(({ type }) => type === DiagramType.ISO)
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
    () => documents.filter(({ type }) => type === DiagramType.ISO),
    [documents]
  );

  useShamefulKeepReactAndOrnateInSync(
    ornateRef,
    discrepancies,
    textAnnotations,
    onDiscrepancyInteraction
  );

  const { tool, onToolChange } = useWorkspaceTools([ornateRef, isoOrnateRef], {
    onDiscrepancyCreate: (
      nodeId: string,
      targetExternalId: string,
      attrs: any
    ) => {
      // Shameful, keep in sync - should ideally happen in useShamefulKeepReactAndOrnateInSync
      // but useShamefulKeepReactAndOrnateInSync would need to refactored to fetch data from
      // multiple sources.
      [ornateRef, isoOrnateRef].forEach((ref) => {
        if (
          ref?.stage.findOne(`#${nodeId}`) === undefined &&
          ref?.stage.findOne(`#${attrs.groupId}`) !== undefined
        ) {
          ref?.addShape(DiscrepancyTool.getDiscrepancyNode(attrs));
        }
      });

      onDiscrepancyChange((prevDiscrepancies) => {
        const discrepancyBase: Discrepancy = {
          id: uuid(),
          comment: '',
          createdAt: new Date(),
          status: 'pending',
          annotations: [],
          ...prevDiscrepancies.find(
            (discrepancy) =>
              discrepancy.id === discrepancyModalState.discrepancyId ||
              discrepancy.status === 'pending'
          ),
        };

        const additionalDiscrepancyAnnotation = {
          nodeId,
          targetExternalId,
        };

        setDiscrepancyModalState((prevDiscrepancyModalState) => ({
          ...prevDiscrepancyModalState,
          discrepancyId: discrepancyBase.id,
        }));

        const existsInCurrentListOfDiscrepancies = prevDiscrepancies.find(
          (discrepancy) => discrepancy.id === discrepancyBase.id
        );

        return [
          ...prevDiscrepancies.map((discrepancy) => {
            if (discrepancy.id === discrepancyModalState.discrepancyId) {
              return {
                ...discrepancyBase,
                ...discrepancy,
                annotations: [
                  ...discrepancy.annotations,
                  additionalDiscrepancyAnnotation,
                ],
              };
            }

            return discrepancy;
          }),
          ...(existsInCurrentListOfDiscrepancies
            ? []
            : [
                {
                  ...discrepancyBase,
                  annotations: [
                    ...discrepancyBase.annotations,
                    additionalDiscrepancyAnnotation,
                  ],
                },
              ]),
        ];
      });
    },
  });

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

    setDiscrepancyModalState((prevState) => ({
      ...prevState,
      discrepancyId: undefined,
      isOpen: false,
    }));
  };

  const onDiscrepancyModalClosePress = () => {
    setDiscrepancyModalState((prevState) => ({
      ...prevState,
      isOpen: false,
    }));
  };

  const groups = (() => {
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
        DiagramType.PID,
        DiagramType.PID
      ),
      columnGap: SLIDE_COLUMN_GAP,
      rowGap: SLIDE_ROW_GAP,
      onSelect: (id: string) =>
        selectedFileConnectionId === id
          ? setSelectedFileConnectionId(undefined)
          : setSelectedFileConnectionId(id),
      selectedId: selectedFileConnectionId,
    });
  })();

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
      DiagramType.ISO;
    if (isLinkedAnnotationInIso && !isIsoModalOpen) {
      setIsIsoModalOpen(true);
    }

    centerOnAnnotationByAnnotationId(
      parsedDocuments,
      isLinkedAnnotationInIso ? isoOrnateRef : ornateRef,
      link.to.annotationId
    );
  };

  const parsedDocumentsByExternalId = keyBy(
    parsedDocuments,
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
                parsedDocumentsByExternalId[from.documentId] !== undefined &&
                parsedDocumentsByExternalId[to.documentId] !== undefined &&
                parsedDocumentsByExternalId[from.documentId].type ===
                  DiagramType.PID
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

  const overlays = parsedDocuments
    .filter(({ type }) => type === DiagramType.PID)
    .flatMap((document) =>
      getDrawingsByDocumentId(parsedDocuments, document.externalId)
    );

  const nodes = [
    ...groups,
    ...overlays,
    ...getDiscrepancyCircleMarkers(
      discrepancies,
      ornateRef,
      (evt, discrepancy) => onDiscrepancyInteraction(ornateRef, discrepancy.id)
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
      removeLineNumberFromDocumentMetadata(
        client,
        pdfExternalId,
        lineReview.id,
        lineReview.unit
      );
    }
  };

  const foundDiscrepancyIndex = discrepancies.findIndex(
    (discrepancy) => discrepancy.id === discrepancyModalState.discrepancyId
  );

  const foundDiscrepancy = discrepancies.find(
    (discrepancy) => discrepancy.id === discrepancyModalState.discrepancyId
  );

  return (
    <>
      {discrepancyModalState.isOpen &&
        foundDiscrepancyIndex >= 0 &&
        foundDiscrepancy && (
          <DiscrepancyModal
            // This is a hack
            documents={documents}
            key={foundDiscrepancy.id}
            index={foundDiscrepancyIndex}
            initialPosition={discrepancyModalState.position}
            initialDiscrepancy={foundDiscrepancy}
            onDeleteDiscrepancyAnnotation={(nodeId: string) => {
              onDiscrepancyChange((prevDiscrepancies) =>
                prevDiscrepancies.map((discrepancy) =>
                  foundDiscrepancy?.id === discrepancy.id
                    ? {
                        ...discrepancy,
                        annotations: discrepancy.annotations.filter(
                          (annotation) => annotation.nodeId !== nodeId
                        ),
                      }
                    : discrepancy
                )
              );
            }}
            onDeletePress={() => onDeleteDiscrepancy(foundDiscrepancy.id)}
            onSave={onSaveDiscrepancy}
            onClosePress={onDiscrepancyModalClosePress}
          />
        )}

      <IsoModal
        onDiscrepancyInteraction={onDiscrepancyInteraction}
        discrepancies={discrepancies}
        parsedDocuments={parsedDocuments}
        isoDocuments={isoDocuments}
        visible={isIsoModalOpen}
        onOrnateRef={setIsoOrnateRef}
        onHidePress={() => setIsIsoModalOpen(false)}
        tool={tool}
        onToolChange={onToolChange}
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
          onDocumentChange={() => setTimeout(() => forceUpdate(), 1500)}
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

        {foundDiscrepancy &&
          foundDiscrepancy.status === 'pending' &&
          !discrepancyModalState.isOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                right: 16,
              }}
            >
              <Button
                type="primary"
                style={{ marginRight: 8 }}
                onClick={() => {
                  if (foundDiscrepancy.annotations.length === 0) {
                    return;
                  }

                  setDiscrepancyModalState((prevDiscrepancyModalState) => ({
                    ...prevDiscrepancyModalState,
                    position: {
                      x: window.innerWidth - 400 - DISCREPANCY_MODAL_OFFSET_X,
                      y: window.innerHeight - 380 - DISCREPANCY_MODAL_OFFSET_Y,
                    },
                    isOpen: true,
                  }));
                }}
              >
                Create discrepancy for marked areas
              </Button>
            </div>
          )}
      </div>
    </>
  );
};

export default LineReviewViewer;
