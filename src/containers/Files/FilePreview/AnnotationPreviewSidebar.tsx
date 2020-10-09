/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  useResourcesSelector,
  useResourcesDispatch,
} from '@cognite/cdf-resources-store';
import {
  Button,
  Icon,
  Title,
  Body,
  Overline,
  Colors,
  Collapse,
} from '@cognite/cogs.js';
import {
  create as createAnnotations,
  remove as removeAnnotations,
} from 'modules/annotations';
import {
  useSelectedAnnotation,
  ProposedCogniteAnnotation,
  useExtractFromCanvas,
} from '@cognite/react-picture-annotation';
import {
  SpacedRow,
  Divider,
  InfoGrid,
  InfoCell,
  CreateAnnotationForm,
} from 'components/Common';
import { Modal, message } from 'antd';
import { trackUsage } from 'utils/Metrics';
import { CogniteAnnotation } from '@cognite/annotations';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import styled from 'styled-components';
import {
  findSimilarObjects,
  selectObjectStatus,
} from 'modules/fileContextualization/similarObjectJobs';
import { useResourceSelector } from 'context/ResourceSelectorContext';
import { ResourceItemState } from 'context/ResourceSelectionContext';
import { useCdfItem } from 'hooks/sdk';
import { FileInfo } from '@cognite/sdk';
import { useQueryCache } from 'react-query';
import { ContextualizationData } from './ContextualizationModule';
import { invalidateEvents } from '../hooks';

type Props = {
  fileId: number;
  contextualization: boolean;
  pendingAnnotations: ProposedCogniteAnnotation[];
  setPendingAnnotations: (annos: ProposedCogniteAnnotation[]) => void;
};

const AnnotationPreviewSidebar = ({
  fileId,
  pendingAnnotations,
  setPendingAnnotations,
  contextualization,
}: Props) => {
  const queryCache = useQueryCache();
  const dispatch = useResourcesDispatch();
  const [editing, setEditing] = useState<boolean>(false);

  const { selectedAnnotation, setSelectedAnnotation } = useSelectedAnnotation();
  const { data: file } = useCdfItem<FileInfo>('files', fileId);

  const extractFromCanvas = useExtractFromCanvas();

  const { openPreview, hidePreview } = useResourcePreview();
  const { openResourceSelector } = useResourceSelector();

  const selectedAnnotationId = selectedAnnotation
    ? selectedAnnotation.id
    : undefined;

  const isPendingAnnotation = typeof selectedAnnotationId === 'string';

  useEffect(() => {
    setEditing(false);
  }, [selectedAnnotationId]);

  const isFindingSimilarObjects = useResourcesSelector(selectObjectStatus)(
    fileId
  );

  let annotationPreview: string | undefined;
  if (selectedAnnotation && extractFromCanvas) {
    const { xMin, yMin, xMax, yMax } = selectedAnnotation.box;
    annotationPreview = extractFromCanvas(xMin, yMin, xMax - xMin, yMax - yMin);
  }

  const isEditingMode = isPendingAnnotation || editing;

  const similarButton = useMemo(() => {
    if (selectedAnnotation) {
      return (
        <Button
          loading={isFindingSimilarObjects}
          icon="Search"
          onClick={() => {
            if (fileId) {
              dispatch(findSimilarObjects(fileId, selectedAnnotation.box));
            }
          }}
        >
          Find Similar
        </Button>
      );
    }
    return null;
  }, [dispatch, selectedAnnotation, isFindingSimilarObjects, fileId]);

  const onSaveDetection = useCallback(async () => {
    if (selectedAnnotation) {
      if (typeof selectedAnnotation.id === 'string') {
        trackUsage('FileViewer.CreateAnnotation', {
          annotation: selectedAnnotation,
        });
        const pendingObj = { ...selectedAnnotation };
        // @ts-ignore
        delete pendingObj.id;
        delete pendingObj.metadata;
        dispatch(createAnnotations(file!, [pendingObj]));
        setTimeout(() => {
          if (file) {
            invalidateEvents(file, queryCache);
          }
        }, 2000);
        setPendingAnnotations(
          pendingAnnotations.filter(el => el.id !== selectedAnnotation.id)
        );
      } else {
        message.info('Coming Soon');
      }
    }
  }, [
    dispatch,
    file,
    queryCache,
    pendingAnnotations,
    selectedAnnotation,
    setPendingAnnotations,
  ]);

  const onLinkResource = useCallback(() => {
    openResourceSelector({
      onSelect: item => {
        setSelectedAnnotation({
          ...selectedAnnotation!,
          resourceType: item.type,
          resourceExternalId: item.externalId,
          resourceId: item.id,
        });
      },
      resourcesState: selectedAnnotation
        ? [
            {
              type: selectedAnnotation.resourceType,
              id: selectedAnnotation.resourceId,
              state: 'selected',
            } as ResourceItemState,
          ]
        : undefined,
      children: annotationPreview && (
        <Collapse defaultActiveKey={[]}>
          <Collapse.Panel key="preview" header="Annotation Preview">
            <PreviewImage src={annotationPreview} alt="preview" />
          </Collapse.Panel>
        </Collapse>
      ),
    });
  }, [
    openResourceSelector,
    selectedAnnotation,
    annotationPreview,
    setSelectedAnnotation,
  ]);

  const onDeleteAnnotation = useCallback(async () => {
    if (selectedAnnotation) {
      if (pendingAnnotations.find(el => el.id === selectedAnnotation.id)) {
        setPendingAnnotations(
          pendingAnnotations.filter(el => el.id !== selectedAnnotation.id)
        );
      } else {
        trackUsage('FileViewer.DeleteAnnotation', {
          annotation: selectedAnnotation,
        });
        Modal.confirm({
          title: 'Are you sure?',
          content: (
            <span>
              This annotations will be deleted. However, you can always
              re-contextualize the file.
            </span>
          ),
          onOk: async () => {
            dispatch(
              removeAnnotations(file!, [
                selectedAnnotation as CogniteAnnotation,
              ])
            );
            setSelectedAnnotation(undefined);
          },
          onCancel: () => {},
        });
      }
    }
  }, [
    selectedAnnotation,
    setSelectedAnnotation,
    dispatch,
    file,
    pendingAnnotations,
    setPendingAnnotations,
  ]);

  const footer = useMemo(() => {
    return (
      <ContextualizationData
        selectedAnnotation={selectedAnnotation}
        extractFromCanvas={extractFromCanvas}
      />
    );
  }, [selectedAnnotation, extractFromCanvas]);

  const header = useMemo(() => {
    if (selectedAnnotation && !isEditingMode) {
      return (
        <InfoGrid noBorders>
          <InfoCell noBorders>
            <Overline level={2}>LABEL</Overline>
            <Title level={5}>{selectedAnnotation.label}</Title>
            <Overline level={2} style={{ marginTop: 8 }}>
              DESCRIPTION
            </Overline>
            <Body level={2}>{selectedAnnotation.description || 'N/A'}</Body>
          </InfoCell>
          {contextualization && (
            <InfoCell noBorders>
              <SpacedRow>
                <Button onClick={() => onDeleteAnnotation()}>
                  <Icon type="Delete" />
                  Delete
                </Button>
                <Button
                  onClick={() => {
                    setEditing(true);
                  }}
                >
                  <Icon type="Edit" />
                  Edit
                </Button>
                {similarButton}
              </SpacedRow>
            </InfoCell>
          )}
          <Divider.Horizontal />
        </InfoGrid>
      );
    }
    return undefined;
  }, [
    selectedAnnotation,
    onDeleteAnnotation,
    isEditingMode,
    contextualization,
    similarButton,
  ]);

  const content = useMemo(() => {
    if (selectedAnnotation && isEditingMode) {
      return (
        <CreateAnnotationForm
          annotation={selectedAnnotation}
          updateAnnotation={setSelectedAnnotation}
          onLinkResource={onLinkResource}
          onDelete={() => {
            onDeleteAnnotation();
            setSelectedAnnotation(undefined);
            setEditing(false);
          }}
          onSave={() => {
            onSaveDetection();
            setEditing(false);
            if (isPendingAnnotation) {
              setSelectedAnnotation(undefined);
            }
          }}
          previewImageSrc={annotationPreview}
          onCancel={isPendingAnnotation ? undefined : () => setEditing(false)}
        >
          <Divider.Horizontal />
          <SpacedRow>{similarButton}</SpacedRow>
        </CreateAnnotationForm>
      );
    }
    return undefined;
  }, [
    isPendingAnnotation,
    selectedAnnotation,
    isEditingMode,
    annotationPreview,
    setSelectedAnnotation,
    onDeleteAnnotation,
    onSaveDetection,
    similarButton,
    onLinkResource,
  ]);

  const type = selectedAnnotation?.resourceType;
  const id =
    selectedAnnotation?.resourceExternalId || selectedAnnotation?.resourceId;

  useEffect(() => {
    if (selectedAnnotationId) {
      openPreview({
        // @ts-ignore
        item: id && type ? { id, type } : undefined,
        header,
        footer,
        content,
        onClose: () => setSelectedAnnotation(undefined),
      });
    }
  }, [
    openPreview,
    selectedAnnotationId,
    id,
    type,
    header,
    content,
    footer,
    setSelectedAnnotation,
  ]);

  useEffect(() => {
    if (!selectedAnnotation) {
      hidePreview();
    }
  }, [selectedAnnotation, hidePreview]);

  return <></>;
};

const PreviewImage = styled.img`
  max-height: 200px;
  padding: 12px;
  background: ${Colors['greyscale-grey3'].hex()};
  width: auto;
  object-fit: contain;
  display: block;
  align-self: flex-start;
  margin-bottom: 16px;
`;

export { AnnotationPreviewSidebar };
